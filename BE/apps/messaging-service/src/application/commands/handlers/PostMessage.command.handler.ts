import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostMessageCommand } from '../PostMessage.command';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { Message } from '../../../domain';
import { OutboxService } from '@app/outbox';
import { ITransactionService } from '@app/common';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { Inject, Logger } from '@nestjs/common';

@CommandHandler(PostMessageCommand)
export class PostMessageCommandHandler implements ICommandHandler<PostMessageCommand> {
  private readonly logger = new Logger(PostMessageCommandHandler.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly conversationRepository: Repository<Message>,
    private readonly outboxService: OutboxService,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(command: PostMessageCommand): Promise<Message> {
    const { senderId, conversationId, content, mediaUrl } = command;

    this.logger.log(
      `Processing new message from sender ${senderId} in conversation ${conversationId}`,
    );

    // Use transaction to ensure message and outbox are saved atomically
    const savedMessage = await this.transactionService.execute(
      async (manager) => {
        // Create and save the message
        const messageRepo = manager.getRepository(Message);
        const message = messageRepo.create({
          senderId,
          conversationId,
          content,
          mediaUrl,
        });
        const saved = await messageRepo.save(message);

        // Get all participants except the sender
        const participantRepo = manager.getRepository(ConversationParticipant);
        const participants = await participantRepo.find({
          where: { conversationId },
        });

        const recipientIds = participants
          .map((p) => p.userId)
          .filter((id) => id !== senderId);

        this.logger.debug(
          `Found ${recipientIds.length} recipients for message notification`,
        );

        // Publish notification event for each recipient
        // Using outbox pattern ensures reliable message delivery
        for (const recipientId of recipientIds) {
          await this.outboxService.createOutboxMessage(
            {
              aggregateType: 'message',
              aggregateId: saved.id,
              eventType: 'NEW_MESSAGE_RECEIVED',
              payload: {
                messageId: saved.id,
                senderId,
                recipientId,
                conversationId,
                content: content || '[Media]',
                hasMedia: !!mediaUrl,
                createdAt: saved.createdAt,
              },
              exchange: ExchangeName.NOTIFICATION_EVENTS,
              routingKey: RoutingKey.NEW_MESSAGE_NOTIFICATION,
            },
            manager,
          );

          this.logger.debug(
            `Queued notification event for recipient ${recipientId}`,
          );
        }

        return saved;
      },
    );

    this.logger.log(
      `Message ${savedMessage.id} saved and notifications queued successfully`,
    );

    return savedMessage;
  }
}
