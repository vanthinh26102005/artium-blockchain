import { Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcExceptionHelper } from '@app/common';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { GetConversationByIdQuery } from '../GetConversationById.query';

@QueryHandler(GetConversationByIdQuery)
export class GetConversationByIdQueryHandler implements IQueryHandler<GetConversationByIdQuery> {
  private readonly logger = new Logger(GetConversationByIdQueryHandler.name);

  constructor(
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async execute(query: GetConversationByIdQuery): Promise<Conversation> {
    const { conversationId, userId } = query;
    this.logger.log(
      `Attempting to retrieve conversation ${conversationId} for user ${userId}`,
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

      // Get conversation with full details
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
        relations: ['participants', 'messages'],
      });

      if (!conversation) {
        this.logger.warn(`Conversation ${conversationId} not found`);
        throw RpcExceptionHelper.notFound('Conversation not found');
      }

      this.logger.log(
        `Successfully retrieved conversation ${conversationId} for user ${userId}`,
      );
      return conversation;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve conversation ${conversationId} for user ${userId}`,
        error.stack,
      );
      throw error;
    }
  }
}
