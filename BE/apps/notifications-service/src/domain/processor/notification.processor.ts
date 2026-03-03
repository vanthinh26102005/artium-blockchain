import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ITransactionService } from '@app/common';
import {
  INotificationHistoryRepository,
  NotificationHistory,
  NotificationStatus,
} from '..';
import { OutboxService } from '@app/outbox';
import { SendEmailEventPayload } from '../dtos/payload';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';

@Injectable()
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
    @Inject(INotificationHistoryRepository)
    private readonly historyRepo: INotificationHistoryRepository,
    private readonly outboxService: OutboxService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleStuckNotifications() {
    this.logger.debug('Bắt đầu chu kỳ kiểm tra các thông báo bị kẹt...');

    await this.transactionService
      .execute(async (manager) => {
        const stuckThreshold = new Date();
        stuckThreshold.setMinutes(stuckThreshold.getMinutes() - 15);

        const stuckNotifications = await this.historyRepo.find(
          {
            where: {
              status: NotificationStatus.PENDING,
              createdAt: { $lte: stuckThreshold },
            },
            orderBy: { createdAt: 'asc' },
            take: 50,
          },
          manager,
        );

        if (stuckNotifications.length === 0) {
          this.logger.debug('Không tìm thấy thông báo nào bị kẹt.');
          return;
        }

        this.logger.log(
          `Phát hiện ${stuckNotifications.length} thông báo bị kẹt. Đang đưa lại vào hàng đợi...`,
        );

        for (const history of stuckNotifications) {
          await this.requeueNotification(history, manager);
        }
      })
      .catch((error) => {
        this.logger.error(
          'Đã xảy ra lỗi trong chu kỳ xử lý thông báo bị kẹt.',
          error?.stack ?? error,
        );
      });
  }

  private async requeueNotification(
    history: NotificationHistory,
    transactionManager: any,
  ) {
    this.logger.log(`Đang xử lý lại thông báo bị kẹt ID: ${history.id}`);

    const recipientEmail = history.metadata?.recipientEmail;
    const template = history.metadata?.template;

    if (!recipientEmail || !template) {
      const failureReason =
        'Thiếu recipientEmail hoặc template trong metadata.';
      this.logger.error(
        `NotificationHistory ID ${history.id}: ${failureReason}`,
      );
      await this.historyRepo.markAsFailed(
        history.id,
        failureReason,
        { retryable: false },
        transactionManager,
      );
      return;
    }

    const requeueAttempt = (history.metadata?.requeueAttempts ?? 0) + 1;
    const requeuedAt = new Date();

    const payload: SendEmailEventPayload = {
      historyId: history.id,
      recipientEmail,
      template,
      context: history.templateContext,
      title: history.title,
      body: history.body,
      metadata: history.metadata,
      retryInfo: {
        isRequeued: true,
        requeueAttempt: requeueAttempt,
        requeuedAt: requeuedAt.toISOString(),
      },
    };

    await this.outboxService.createOutboxMessage(
      {
        aggregateType: 'notification',
        aggregateId: history.id,
        eventType: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
        payload,
        exchange: ExchangeName.NOTIFICATION_EVENTS,
        routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
      },
      transactionManager,
    );

    const meta = { ...(history.metadata ?? {}) };
    meta.requeueAttempts = (meta.requeueAttempts ?? 0) + 1;
    meta.lastRequeueAt = new Date().toISOString();

    await this.historyRepo.update(
      history.id,
      { metadata: meta },
      transactionManager,
    );

    this.logger.log(`Đã đưa thông báo ID ${history.id} vào hàng đợi Outbox`);
  }
}
