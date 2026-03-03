import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { PostMessageCommand } from '../../../application/commands/PostMessage.command';
import { UpdateMessageCommand } from '../../../application/commands/UpdateMessage.command';
import { DeleteMessageCommand } from '../../../application/commands/DeleteMessage.command';
import { MarkMessageAsReadCommand } from '../../../application/commands/MarkMessageAsRead.command';
import { GetMessageByIdQuery } from '../../../application/queries/GetMessageById.query';
import { Message } from '../../../domain/entities/message.entity';
import { ReadReceipt } from '../../../domain/entities/read-receipt.entity';
import {
  SendMessageDto,
  UpdateMessageDto,
  DeleteMessageDto,
  MarkMessageReadDto,
} from '@app/common';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':messageId')
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiParam({ name: 'messageId', type: 'string', description: 'Message ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
    type: Message,
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async getMessageById(
    @Param('messageId') messageId: string,
    @Query('userId') userId: string,
  ): Promise<Message> {
    return this.queryBus.execute(new GetMessageByIdQuery(messageId, userId));
  }

  @Post()
  @ApiOperation({ summary: 'Post a new message' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message posted successfully',
    type: Message,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async postMessage(@Body() body: SendMessageDto): Promise<Message> {
    return this.commandBus.execute(
      new PostMessageCommand(
        body.senderId,
        body.conversationId,
        body.content,
        body.mediaUrl,
      ),
    );
  }

  @Put(':messageId')
  @ApiOperation({ summary: 'Update message content' })
  @ApiParam({ name: 'messageId', type: 'string', description: 'Message ID' })
  @ApiBody({ type: UpdateMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully',
    type: Message,
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() body: UpdateMessageDto,
  ): Promise<Message> {
    return this.commandBus.execute(
      new UpdateMessageCommand(messageId, body.userId, body.content),
    );
  }

  @Delete(':messageId')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'messageId', type: 'string', description: 'Message ID' })
  @ApiBody({ type: DeleteMessageDto })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Body() body: DeleteMessageDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteMessageCommand(messageId, body.userId),
    );
  }

  @Post('read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiBody({ type: MarkMessageReadDto })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read successfully',
    type: ReadReceipt,
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async markMessageAsRead(
    @Body() body: MarkMessageReadDto,
  ): Promise<ReadReceipt> {
    return this.commandBus.execute(
      new MarkMessageAsReadCommand(body.messageId, body.userId),
    );
  }
}
