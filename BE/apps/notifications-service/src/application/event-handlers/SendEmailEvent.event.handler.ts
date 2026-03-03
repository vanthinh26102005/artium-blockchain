import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  INotificationHistoryRepository,
  NotificationStatus,
  NotificationTriggerEvent,
  NotificationChannel,
} from 'apps/notifications-service/src/domain';
import { MailerService } from '@nestjs-modules/mailer';
import { ITransactionService } from '@app/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  DeadLetterExchangeName,
  DeadLetterRoutingKey,
  ExchangeName,
  QueueName,
  RoutingKey,
} from '@app/rabbitmq';
import { SendEmailEventPayload } from '../../domain/dtos/payload';

@Injectable()
export class SendEmailEventHandler {
  private readonly logger = new Logger(SendEmailEventHandler.name);

  constructor(
    private readonly mailerService: MailerService,
    @Inject(INotificationHistoryRepository)
    private readonly notificationHistoryRepo: INotificationHistoryRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.NOTIFICATION_EVENTS,
    routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
    queue: QueueName.NOTIFICATION_TRANSACTIONAL_EMAIL,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange':
          DeadLetterExchangeName.NOTIFICATION_EVENTS_DLX,
        'x-dead-letter-routing-key':
          DeadLetterRoutingKey.SEND_TRANSACTIONAL_EMAIL_FAILED,
      },
    },
    errorHandler: (channel, msg, props) => {
      channel.nack(msg, false, false);
    },
  })
  async handle(event: SendEmailEventPayload) {
    const recipientEmail = event.recipientEmail || event.to;
    const title = event.title || event.subject;
    const template = event.template;
    const context = event.context;
    const body = event.body || '';
    const metadata = event.metadata || {};
    const retryInfo = event.retryInfo;
    let historyId = event.historyId;

    if (!recipientEmail) {
      this.logger.error('Missing recipient email in payload', event);
      throw new Error('recipientEmail or to field is required');
    }

    if (!title) {
      this.logger.error('Missing email title/subject in payload', event);
      throw new Error('title or subject field is required');
    }

    if (!historyId) {
      this.logger.log(
        `No historyId provided, creating NotificationHistory record for ${recipientEmail}`,
      );

      await this.transactionService.execute(async (manager) => {
        const triggerEvent =
          (event.triggerEvent as NotificationTriggerEvent) ||
          NotificationTriggerEvent.GENERIC_ALERT;

        const history = await this.notificationHistoryRepo.create(
          {
            userId: event.userId,
            channel: NotificationChannel.EMAIL,
            triggerEvent: triggerEvent,
            title: title,
            body: body,
            templateContext: context,
            status: NotificationStatus.PENDING,
            metadata: {
              ...metadata,
              template: template,
              recipientEmail: recipientEmail,
              autoCreated: true,
            },
          },
          manager,
        );

        historyId = history.id;
        this.logger.log(`Created NotificationHistory with id=${historyId}`);
      });
    }

    if (retryInfo?.isRequeued) {
      this.logger.log(
        `Đang xử lý email được gửi lại cho historyId=${historyId}. Lần thử lại từ processor: ${retryInfo.requeueAttempt}`,
      );
    } else {
      this.logger.log(`Đang xử lý email lần đầu cho historyId=${historyId}`);
    }

    this.logger.debug(
      `Sending email with template="${template}", to="${recipientEmail}", context=${JSON.stringify(context)}`,
    );

    try {
      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: title,
        template: template,
        context,
      });
      this.logger.log(`Email sent successfully (historyId=${historyId})`);

      if (historyId) {
        const recordId = historyId;
        await this.transactionService.execute(async (manager) => {
          await this.notificationHistoryRepo.update(
            recordId,
            {
              status: NotificationStatus.SENT,
              sentAt: new Date(),
              metadata: {
                ...(metadata ?? {}),
                lastAttemptAt: new Date().toISOString(),
              },
            },
            manager,
          );
        });
      }
    } catch (err) {
      this.logger.error(
        `Failed to send email (historyId=${historyId})`,
        err?.stack ?? err,
      );

      if (historyId) {
        const recordId = historyId;
        const retryCount =
          await this.notificationHistoryRepo.incrementRetryCount(recordId);
        await this.transactionService.execute(async (manager) => {
          await this.notificationHistoryRepo.update(
            recordId,
            {
              status: NotificationStatus.FAILED,
              failureReason: err?.message ?? 'Unknown error',
              metadata: {
                ...(metadata ?? {}),
                retryCount,
                sendError: {
                  message: err?.message,
                  stack:
                    typeof err?.stack === 'string'
                      ? err.stack.substring(0, 2000)
                      : undefined,
                },
              },
              sentAt: new Date(),
            },
            manager,
          );
        });
      }

      throw err;
    }
  }
}
