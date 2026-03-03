import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcExceptionHelper } from '@app/common';
import { Message } from '../../../domain/entities/message.entity';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { ReadReceipt } from '../../../domain/entities/read-receipt.entity';
import { MarkMessageAsReadCommand } from '../MarkMessageAsRead.command';

@CommandHandler(MarkMessageAsReadCommand)
export class MarkMessageAsReadCommandHandler implements ICommandHandler<
  MarkMessageAsReadCommand,
  ReadReceipt
> {
  private readonly logger = new Logger(MarkMessageAsReadCommandHandler.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(ReadReceipt)
    private readonly readReceiptRepository: Repository<ReadReceipt>,
  ) {}

  async execute(command: MarkMessageAsReadCommand): Promise<ReadReceipt> {
    const { messageId, userId } = command;
    this.logger.log(
      `Attempting to mark message ${messageId} as read by user ${userId}`,
    );

    try {
      // Get the message first
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
      });

      if (!message) {
        this.logger.warn(
          `Message ${messageId} not found for marking as read by user ${userId}`,
        );
        throw RpcExceptionHelper.notFound('Message not found');
      }

      // Check if user is a participant in the conversation
      const participant = await this.participantRepository.findOne({
        where: { userId, conversationId: message.conversationId },
      });

      if (!participant) {
        this.logger.warn(
          `User ${userId} is not a participant in conversation ${message.conversationId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'User is not a participant in this conversation',
        );
      }

      // Check if user is not the sender (you don't mark your own messages as read)
      if (message.senderId === userId) {
        this.logger.warn(
          `User ${userId} attempted to mark their own message ${messageId} as read`,
        );
        throw RpcExceptionHelper.forbidden(
          'Cannot mark your own message as read',
        );
      }

      // Check if read receipt already exists
      let readReceipt = await this.readReceiptRepository.findOne({
        where: { messageId, userId },
      });

      if (readReceipt) {
        // Update existing read receipt
        readReceipt.readAt = new Date();
        readReceipt = await this.readReceiptRepository.save(readReceipt);
        this.logger.log(
          `Updated existing read receipt for message ${messageId} by user ${userId}`,
        );
      } else {
        // Create new read receipt
        readReceipt = this.readReceiptRepository.create({
          messageId,
          userId,
          conversationId: message.conversationId,
          readAt: new Date(),
          deliveredAt: new Date(),
        });
        readReceipt = await this.readReceiptRepository.save(readReceipt);
        this.logger.log(
          `Created new read receipt for message ${messageId} by user ${userId}`,
        );
      }

      return readReceipt;
    } catch (error) {
      this.logger.error(
        `Failed to mark message ${messageId} as read by user ${userId}`,
        error.stack,
      );
      throw error;
    }
  }
}
