import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateConversationCommand } from '../../../application/commands/CreateConversation.command';
import { GetConversationsForUserQuery } from '../../../application/queries/GetConversationsForUser.query';
import { GetConversationByIdQuery } from '../../../application/queries/GetConversationById.query';
import { Conversation } from '../../../domain/entities/conversation.entity';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('user/:userId')
  async getConversationsForUser(
    @Param('userId') userId: string,
  ): Promise<Conversation[]> {
    return this.queryBus.execute(new GetConversationsForUserQuery(userId));
  }

  @Get(':conversationId')
  async getConversationById(
    @Param('conversationId') conversationId: string,
    @Query('userId') userId: string,
  ): Promise<Conversation> {
    return this.queryBus.execute(
      new GetConversationByIdQuery(conversationId, userId),
    );
  }

  @Post()
  async createConversation(
    @Body() body: { creatorId: string; memberIds: string[] },
  ): Promise<Conversation> {
    return this.commandBus.execute(
      new CreateConversationCommand(body.creatorId, body.memberIds),
    );
  }

  @Post(':conversationId/participants')
  async addParticipants(
    @Param('conversationId') conversationId: string,
    @Body() body: { actorId: string; newUserIds: string[] },
  ) {
    // TODO: Implement AddParticipantsCommand
    throw new Error('Not implemented yet');
  }

  @Get(':conversationId/messages')
  async getMessagesInConversation(
    @Param('conversationId') conversationId: string,
    @Query('userId') userId: string,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    const { GetMessagesInConversationQuery } =
      await import('../../../application/queries/GetMessagesInConversation.query');
    return this.queryBus.execute(
      new GetMessagesInConversationQuery(
        conversationId,
        userId,
        +limit,
        +offset,
      ),
    );
  }
}
