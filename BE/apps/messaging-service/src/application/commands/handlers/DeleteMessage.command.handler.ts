import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcExceptionHelper } from '@app/common';
import { Message } from '../../../domain/entities/message.entity';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { DeleteMessageCommand } from '../DeleteMessage.command';

@CommandHandler(DeleteMessageCommand)
export class DeleteMessageCommandHandler implements ICommandHandler<
  DeleteMessageCommand,
  void
> {
  private readonly logger = new Logger(DeleteMessageCommandHandler.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
  ) {}

  async execute(command: DeleteMessageCommand): Promise<void> {
    const { messageId, userId } = command;
    this.logger.log(
      `Attempting to delete message ${messageId} by user ${userId}`,
    );

    try {
      // Get the message first
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
      });

      if (!message) {
        this.logger.warn(
          `Message ${messageId} not found for deletion by user ${userId}`,
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

      // Check if user owns the message (only message sender can delete)
      if (message.senderId !== userId) {
        this.logger.warn(
          `User ${userId} attempted to delete message ${messageId} owned by user ${message.senderId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'Only the message sender can delete the message',
        );
      }

      // Delete the message
      await this.messageRepository.remove(message);
      this.logger.log(
        `Successfully deleted message ${messageId} by user ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete message ${messageId} by user ${userId}`,
        error.stack,
      );
      throw error;
    }
  }
}
