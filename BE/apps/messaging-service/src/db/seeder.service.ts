import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../domain/entities/conversation.entity';
import { Message } from '../domain/entities/message.entity';
import { ConversationParticipant } from '../domain/entities/conversation-participant.entity';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
  ) {}

  async seed() {
    console.log('Seeding messaging service data...');
    // Seed logic can be implemented here if needed for application bootstrap
    // For now, use run-seeds.ts for explicit seeding
  }
}
