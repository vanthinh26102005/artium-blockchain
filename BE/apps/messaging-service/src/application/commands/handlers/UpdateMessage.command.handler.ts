import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcExceptionHelper } from '@app/common';
import { Message } from '../../../domain/entities/message.entity';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { UpdateMessageCommand } from '../UpdateMessage.command';

@CommandHandler(UpdateMessageCommand)
export class UpdateMessageCommandHandler implements ICommandHandler<
  UpdateMessageCommand,
  Message
> {
  private readonly logger = new Logger(UpdateMessageCommandHandler.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
  ) {}

  async execute(command: UpdateMessageCommand): Promise<Message> {
    const { messageId, userId, content, mediaUrl } = command;
    this.logger.log(
      `Attempting to update message ${messageId} by user ${userId}`,
    );

    try {
      // Validate that at least one field is provided
      if (!content && !mediaUrl) {
        this.logger.warn(
          `Update request for message ${messageId} by user ${userId} has no content or mediaUrl`,
        );
        throw RpcExceptionHelper.badRequest(
          'At least content or mediaUrl must be provided',
        );
      }

      // Get the message first
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
      });

      if (!message) {
        this.logger.warn(
          `Message ${messageId} not found for update by user ${userId}`,
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

      // Check if user owns the message (only message sender can update)
      if (message.senderId !== userId) {
        this.logger.warn(
          `User ${userId} attempted to update message ${messageId} owned by user ${message.senderId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'Only the message sender can update the message',
        );
      }

      // Update the message fields
      if (content !== undefined) {
        message.content = content;
      }
      if (mediaUrl !== undefined) {
        message.mediaUrl = mediaUrl;
      }

      // Save the updated message
      const updatedMessage = await this.messageRepository.save(message);
      this.logger.log(
        `Successfully updated message ${messageId} by user ${userId}`,
      );

      return updatedMessage;
    } catch (error) {
      this.logger.error(
        `Failed to update message ${messageId} by user ${userId}`,
        error.stack,
      );
      throw error;
    }
  }
}
