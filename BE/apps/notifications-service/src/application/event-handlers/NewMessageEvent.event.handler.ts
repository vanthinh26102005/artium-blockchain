import { Inject, Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  DeadLetterExchangeName,
  DeadLetterRoutingKey,
  ExchangeName,
  QueueName,
  RoutingKey,
} from '@app/rabbitmq';
import { ITransactionService } from '@app/common';
import {
  INotificationHistoryRepository,
  NotificationChannel,
  NotificationStatus,
  NotificationTriggerEvent,
} from '../../domain';
import { OutboxService } from '@app/outbox';

export interface NewMessageEventPayload {
  messageId: string;
  senderId: string;
  recipientId: string;
  conversationId: string;
  content: string;
  hasMedia: boolean;
  createdAt: Date;
}

@Injectable()
export class NewMessageEventHandler {
  private readonly logger = new Logger(NewMessageEventHandler.name);

  constructor(
    @Inject(INotificationHistoryRepository)
    private readonly notificationHistoryRepo: INotificationHistoryRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
    private readonly outboxService: OutboxService,
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.NOTIFICATION_EVENTS,
    routingKey: RoutingKey.NEW_MESSAGE_NOTIFICATION,
    queue: QueueName.NOTIFICATION_NEW_MESSAGE,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange':
          DeadLetterExchangeName.NOTIFICATION_EVENTS_DLX,
        'x-dead-letter-routing-key':
          DeadLetterRoutingKey.NEW_MESSAGE_NOTIFICATION_FAILED,
      },
    },
    errorHandler: (channel, msg, props) => {
      channel.nack(msg, false, false);
    },
  })
  async handle(event: NewMessageEventPayload) {
    const { messageId, senderId, recipientId, conversationId, content, hasMedia } = event;

    this.logger.log(
      `Processing new message notification: messageId=${messageId}, recipientId=${recipientId}`,
    );

    try {
      // TODO: Fetch sender and recipient details from identity service
      // For now, we'll use placeholder values
      const senderName = senderId; // Should be fetched from identity service
      const recipientEmail = `${recipientId}@example.com`; // Should be fetched from identity service

      const messagePreview = content.length > 50 
        ? `${content.substring(0, 50)}...` 
        : content;

      const displayContent = hasMedia 
        ? 'Sent you a media file' 
        : messagePreview;

      await this.transactionService.execute(async (manager) => {
        // Create notification history record
        const history = await this.notificationHistoryRepo.create(
          {
            userId: recipientId,
            channel: NotificationChannel.EMAIL,
            triggerEvent: NotificationTriggerEvent.NEW_MESSAGE_RECEIVED,
            title: `New message from ${senderName}`,
            body: displayContent,
            templateContext: {
              senderName,
              messageContent: displayContent,
              conversationId,
            },
            status: NotificationStatus.PENDING,
            metadata: {
              messageId,
              senderId,
              conversationId,
              recipientEmail,
              template: 'new-message',
              autoCreated: true,
            },
          },
          manager,
        );

        this.logger.debug(
          `Created notification history record: ${history.id} for recipient ${recipientId}`,
        );

        // Queue email notification via outbox
        await this.outboxService.createOutboxMessage(
          {
            aggregateType: 'notification',
            aggregateId: history.id,
            eventType: 'SEND_NEW_MESSAGE_EMAIL',
            payload: {
              historyId: history.id,
              userId: recipientId,
              recipientEmail,
              to: recipientEmail,
              subject: `New message from ${senderName}`,
              title: `New message from ${senderName}`,
              template: 'new-message',
              context: {
                senderName,
                messageContent: displayContent,
                conversationId,
                messageId,
              },
              triggerEvent: NotificationTriggerEvent.NEW_MESSAGE_RECEIVED,
              metadata: {
                messageId,
                senderId,
                conversationId,
              },
            },
            exchange: ExchangeName.NOTIFICATION_EVENTS,
            routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
          },
          manager,
        );

        this.logger.log(
          `Queued email notification for new message: messageId=${messageId}, recipientId=${recipientId}`,
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to process new message notification: messageId=${messageId}`,
        error?.stack ?? error,
      );
      throw error;
    }
  }
}
