import { Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcExceptionHelper } from '@app/common';
import { Message } from '../../../domain/entities/message.entity';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { GetMessageByIdQuery } from '../GetMessageById.query';

@QueryHandler(GetMessageByIdQuery)
export class GetMessageByIdQueryHandler implements IQueryHandler<GetMessageByIdQuery> {
  private readonly logger = new Logger(GetMessageByIdQueryHandler.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
  ) {}

  async execute(query: GetMessageByIdQuery): Promise<Message> {
    const { messageId, userId } = query;
    this.logger.log(
      `Attempting to retrieve message ${messageId} for user ${userId}`,
    );

    try {
      // Get the message first
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['conversation'],
      });

      if (!message) {
        this.logger.warn(`Message ${messageId} not found`);
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

      this.logger.log(
        `Successfully retrieved message ${messageId} for user ${userId}`,
      );
      return message;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve message ${messageId} for user ${userId}`,
        error.stack,
      );
      throw error;
    }
  }
}
