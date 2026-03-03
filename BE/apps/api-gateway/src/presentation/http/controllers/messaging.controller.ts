import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MICROSERVICES } from '../../../config';
import { JwtAuthGuard, CurrentUser } from '@app/auth';
import {
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  MarkMessageReadDto,
} from '@app/common';
import { sendRpc } from '../utils';

@ApiTags('Messaging')
@Controller('messaging')
export class MessagingController {
  constructor(
    @Inject(MICROSERVICES.MESSAGING_SERVICE)
    private readonly messagingClient: ClientProxy,
  ) {}

  @Get('conversations/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get conversations for user' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
  })
  async getConversationsForUser(@Param('userId') userId: string) {
    return sendRpc(
      this.messagingClient,
      { cmd: 'get_conversations_for_user' },
      { userId },
    );
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Conversation ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversationById(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return sendRpc(
      this.messagingClient,
      { cmd: 'get_conversation_by_id' },
      { conversationId: id, userId },
    );
  }

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new conversation' })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createConversation(@Body() data: CreateConversationDto) {
    return sendRpc(this.messagingClient, { cmd: 'create_conversation' }, data);
  }

  @Get('conversations/:conversationId/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages in conversation' })
  @ApiParam({
    name: 'conversationId',
    type: 'string',
    description: 'Conversation ID',
  })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of messages to fetch (default: 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: 'number',
    description: 'Offset for pagination (default: 0)',
  })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getMessagesInConversation(
    @Param('conversationId') conversationId: string,
    @Query('userId') userId: string,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    return sendRpc(
      this.messagingClient,
      { cmd: 'get_messages_in_conversation' },
      {
        conversationId,
        userId,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      },
    );
  }

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async sendMessage(@Body() data: SendMessageDto) {
    return sendRpc(this.messagingClient, { cmd: 'send_message' }, data);
  }

  @Get('messages/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiParam({ name: 'messageId', type: 'string', description: 'Message ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async getMessageById(
    @Param('messageId') messageId: string,
    @Query('userId') userId: string,
  ) {
    return sendRpc(
      this.messagingClient,
      { cmd: 'get_message_by_id' },
      { messageId, userId },
    );
  }

  @Put('messages/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update message' })
  @ApiParam({ name: 'messageId', type: 'string', description: 'Message ID' })
  @ApiBody({ type: UpdateMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() data: UpdateMessageDto,
  ) {
    return sendRpc(
      this.messagingClient,
      { cmd: 'update_message' },
      { messageId, ...data },
    );
  }

  @Delete('messages/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete message' })
  @ApiParam({ name: 'messageId', type: 'string', description: 'Message ID' })
  @ApiQuery({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Query('userId') userId: string,
  ) {
    return sendRpc(
      this.messagingClient,
      { cmd: 'delete_message' },
      { messageId, userId },
    );
  }

  @Post('messages/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiBody({ type: MarkMessageReadDto })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read successfully',
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async markMessageAsRead(@Body() data: MarkMessageReadDto) {
    return sendRpc(this.messagingClient, { cmd: 'mark_message_as_read' }, data);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file for messaging' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        filename: { type: 'string' },
        size: { type: 'number' },
        mimetype: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return sendRpc(this.messagingClient, { cmd: 'upload_file' }, { file });
  }
}
