import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../domain/entities/conversation.entity';
import { Message } from '../domain/entities/message.entity';
import { ConversationParticipant } from '../domain/entities/conversation-participant.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private participantRepository: Repository<ConversationParticipant>,
    private readonly httpService: HttpService,
  ) {}

  async createConversation(
    creatorId: string,
    memberIds: string[],
  ): Promise<Conversation> {
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

  async addUsersToGroup(
    actorId: string,
    conversationId: string,
    newUserIds: string[],
  ): Promise<ConversationParticipant[]> {
    // TODO: Add logic to ensure actorId is part of the conversation and has permission to add users
    const participants = newUserIds.map((userId) =>
      this.participantRepository.create({ userId, conversationId }),
    );
    return this.participantRepository.save(participants);
  }

  async postMessage(
    senderId: string,
    conversationId: string,
    content?: string,
    mediaUrl?: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      senderId,
      conversationId,
      content,
      mediaUrl,
    });
    const savedMessage = await this.messageRepository.save(message);

    // Assume we have a way to check if users are online
    const onlineUserIds: string[] = []; // This would be populated from a cache or presence service

    const participants = await this.participantRepository.find({
      where: { conversationId },
    });
    const recipientIds = participants
      .map((p) => p.userId)
      .filter((id) => id !== senderId);

    const offlineUserIds = recipientIds.filter(
      (id) => !onlineUserIds.includes(id),
    );

    for (const userId of offlineUserIds) {
      this.notifyUser(userId, `New message in conversation`, conversationId);
    }

    return savedMessage;
  }

  private async notifyUser(userId: string, title: string, message: string) {
    try {
      // As per the prompt, we assume a REST endpoint for the notification-service
      const url = 'http://notification-service/api/v1/notify'; // This should be in a config file
      await firstValueFrom(
        this.httpService.post(url, { userId, title, message }),
      );
    } catch (error) {
      // Handle error (e.g., log it)
      console.error(`Failed to send notification to user ${userId}`, error);
    }
  }

  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    const participants = await this.participantRepository.find({
      where: { userId },
      relations: ['conversation'],
    });
    return participants.map((p) => p.conversation);
  }
}
