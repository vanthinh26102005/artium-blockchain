import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { GetConversationsForUserQuery } from '../GetConversationsForUser.query';

@QueryHandler(GetConversationsForUserQuery)
export class GetConversationsForUserQueryHandler implements IQueryHandler<GetConversationsForUserQuery> {
  constructor(
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
  ) {}

  async execute(query: GetConversationsForUserQuery): Promise<Conversation[]> {
    const { userId } = query;
    const participants = await this.participantRepository.find({
      where: { userId },
      relations: ['conversation'],
    });
    return participants.map((p) => p.conversation);
  }
}
