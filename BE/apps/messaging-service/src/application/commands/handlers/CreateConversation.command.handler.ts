import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { CreateConversationCommand } from '../CreateConversation.command';

@CommandHandler(CreateConversationCommand)
export class CreateConversationCommandHandler implements ICommandHandler<CreateConversationCommand> {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
  ) {}

  async execute(command: CreateConversationCommand): Promise<Conversation> {
    const { creatorId, memberIds } = command;
    const isGroup = memberIds.length > 1;
    const allMemberIds = [creatorId, ...memberIds];

    const conversation = this.conversationRepository.create({ isGroup });
    const savedConversation =
      await this.conversationRepository.save(conversation);

    const participants = allMemberIds.map((userId) =>
      this.participantRepository.create({
        userId,
        conversationId: savedConversation.id,
      }),
    );
    await this.participantRepository.save(participants);

    return savedConversation;
  }
}
