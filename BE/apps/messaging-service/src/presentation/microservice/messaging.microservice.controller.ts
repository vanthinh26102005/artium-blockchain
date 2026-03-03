import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PostMessageCommand } from '../../application/commands/PostMessage.command';
import { UpdateMessageCommand } from '../../application/commands/UpdateMessage.command';
import { DeleteMessageCommand } from '../../application/commands/DeleteMessage.command';
import { MarkMessageAsReadCommand } from '../../application/commands/MarkMessageAsRead.command';
import { CreateConversationCommand } from '../../application/commands/CreateConversation.command';
import { GetConversationsForUserQuery } from '../../application/queries/GetConversationsForUser.query';
import { GetConversationByIdQuery } from '../../application/queries/GetConversationById.query';
import { GetMessageByIdQuery } from '../../application/queries/GetMessageById.query';
import { GetMessagesInConversationQuery } from '../../application/queries/GetMessagesInConversation.query';
import { GcsStorageService } from '../../domain/services/gcs-storage.service';

@Controller()
export class MessagingMicroserviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly gcsStorage: GcsStorageService,
  ) {}

  @MessagePattern({ cmd: 'get_conversations_for_user' })
  async getConversationsForUser(@Payload() data: { userId: string }) {
    return this.queryBus.execute(new GetConversationsForUserQuery(data.userId));
  }

  @MessagePattern({ cmd: 'get_conversation_by_id' })
  async getConversationById(
    @Payload() data: { conversationId: string; userId: string },
  ) {
    return this.queryBus.execute(
      new GetConversationByIdQuery(data.conversationId, data.userId),
    );
  }

  @MessagePattern({ cmd: 'create_conversation' })
  async createConversation(
    @Payload() data: { participantIds: string[]; title?: string },
  ) {
    const creatorId = data.participantIds[0];
    const memberIds = data.participantIds.slice(1);
    return this.commandBus.execute(
      new CreateConversationCommand(creatorId, memberIds),
    );
  }

  @MessagePattern({ cmd: 'get_messages_in_conversation' })
  async getMessagesInConversation(
    @Payload()
    data: {
      conversationId: string;
      userId: string;
      limit: number;
      offset: number;
    },
  ) {
    return this.queryBus.execute(
      new GetMessagesInConversationQuery(
        data.conversationId,
        data.userId,
        data.limit || 50,
        data.offset || 0,
      ),
    );
  }

  @MessagePattern({ cmd: 'send_message' })
  async sendMessage(
    @Payload()
    data: {
      senderId: string;
      conversationId: string;
      content?: string;
      mediaUrl?: string;
    },
  ) {
    return this.commandBus.execute(
      new PostMessageCommand(
        data.senderId,
        data.conversationId,
        data.content,
        data.mediaUrl,
      ),
    );
  }

  @MessagePattern({ cmd: 'get_message_by_id' })
  async getMessageById(@Payload() data: { messageId: string; userId: string }) {
    return this.queryBus.execute(
      new GetMessageByIdQuery(data.messageId, data.userId),
    );
  }

  @MessagePattern({ cmd: 'update_message' })
  async updateMessage(
    @Payload() data: { messageId: string; userId: string; content: string },
  ) {
    return this.commandBus.execute(
      new UpdateMessageCommand(data.messageId, data.userId, data.content),
    );
  }

  @MessagePattern({ cmd: 'delete_message' })
  async deleteMessage(@Payload() data: { messageId: string; userId: string }) {
    await this.commandBus.execute(
      new DeleteMessageCommand(data.messageId, data.userId),
    );
    return { success: true };
  }

  @MessagePattern({ cmd: 'mark_message_as_read' })
  async markMessageAsRead(
    @Payload() data: { messageId: string; userId: string },
  ) {
    return this.commandBus.execute(
      new MarkMessageAsReadCommand(data.messageId, data.userId),
    );
  }

  @MessagePattern({ cmd: 'upload_file' })
  async uploadFile(@Payload() data: { file: any }) {
    const file = data.file;

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Handle buffer conversion if needed
    let buffer = file.buffer;
    if (!Buffer.isBuffer(buffer)) {
      if (
        typeof buffer === 'object' &&
        buffer !== null &&
        buffer.type === 'Buffer' &&
        Array.isArray(buffer.data)
      ) {
        buffer = Buffer.from(buffer.data);
      } else {
        throw new BadRequestException('Invalid file buffer');
      }
    }

    // Validate file type
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only images, videos, and documents are allowed.',
      );
    }

    // Validate file size (10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Upload to Google Cloud Storage
    const result = await this.gcsStorage.uploadBuffer(buffer, {
      folder: 'messaging',
      fileName: file.originalname,
      makePublic: true,
    });

    // Determine file type for frontend
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    const isPdf = file.mimetype === 'application/pdf';

    return {
      url: result.url,
      filename: file.originalname,
      size: result.size,
      mimetype: file.mimetype,
      type: isImage ? 'IMAGE' : isVideo ? 'VIDEO' : isPdf ? 'FILE' : 'FILE',
      isImage,
      isVideo,
    };
  }
}
