import { Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcExceptionHelper } from '@app/common';
import { Message } from '../../../domain/entities/message.entity';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { GetMessagesInConversationQuery } from '../GetMessagesInConversation.query';

@QueryHandler(GetMessagesInConversationQuery)
export class GetMessagesInConversationQueryHandler implements IQueryHandler<GetMessagesInConversationQuery> {
  private readonly logger = new Logger(
    GetMessagesInConversationQueryHandler.name,
  );

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
  ) {}

  async execute(query: GetMessagesInConversationQuery): Promise<Message[]> {
    const { conversationId, userId, limit = 50, offset = 0 } = query;
    this.logger.log(
      `Attempting to retrieve messages for conversation ${conversationId} (limit: ${limit}, offset: ${offset}) for user ${userId}`,
    );

    try {
      // First check if user is a participant in the conversation
      const participant = await this.participantRepository.findOne({
        where: { userId, conversationId },
      });

      if (!participant) {
        this.logger.warn(
          `User ${userId} is not a participant in conversation ${conversationId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'User is not a participant in this conversation',
        );
      }

      // Get messages with pagination, ordered by creation time ascending (oldest first)
      const messages = await this.messageRepository.find({
        where: { conversationId },
        order: { createdAt: 'ASC' }, // Get oldest messages first for chat display
        skip: offset,
        take: limit,
      });

      this.logger.log(
        `Successfully retrieved ${messages.length} messages for conversation ${conversationId} for user ${userId}`,
      );
      return messages;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve messages for conversation ${conversationId} for user ${userId}`,
        error.stack,
      );
      throw error;
    }
  }
}
