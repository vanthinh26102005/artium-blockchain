import { DynamicDatabaseModule, ITransactionService, TransactionService } from '@app/common';
import { OutboxEntity, OutboxModule } from '@app/outbox';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateConversationCommandHandler } from './application/commands/handlers/CreateConversation.command.handler';
import { DeleteMessageCommandHandler } from './application/commands/handlers/DeleteMessage.command.handler';
import { MarkMessageAsReadCommandHandler } from './application/commands/handlers/MarkMessageAsRead.command.handler';
import { PostMessageCommandHandler } from './application/commands/handlers/PostMessage.command.handler';
import { UpdateMessageCommandHandler } from './application/commands/handlers/UpdateMessage.command.handler';
import { GetConversationByIdQueryHandler } from './application/queries/handlers/GetConversationById.query.handler';
import { GetConversationsForUserQueryHandler } from './application/queries/handlers/GetConversationsForUser.query.handler';
import { GetMessageByIdQueryHandler } from './application/queries/handlers/GetMessageById.query.handler';
import { GetMessagesInConversationQueryHandler } from './application/queries/handlers/GetMessagesInConversation.query.handler';
import { ConversationParticipant } from './domain/entities/conversation-participant.entity';
import { Conversation } from './domain/entities/conversation.entity';
import { Message } from './domain/entities/message.entity';
import { ReadReceipt } from './domain/entities/read-receipt.entity';
import { GcsStorageService } from './domain/services/gcs-storage.service';
import { MessagingGateway } from './presentation/gateways/messaging.gateway';
import { ConversationsController } from './presentation/http/controllers/conversations.controller';
import { MessagesController } from './presentation/http/controllers/messages.controller';
import { UploadController } from './presentation/http/controllers/upload.controller';
import { MessagingMicroserviceController } from './presentation/microservice/messaging.microservice.controller';

export const CommandHandlers = [
  PostMessageCommandHandler,
  CreateConversationCommandHandler,
  UpdateMessageCommandHandler,
  DeleteMessageCommandHandler,
  MarkMessageAsReadCommandHandler,
];

export const QueryHandlers = [
  GetConversationsForUserQueryHandler,
  GetConversationByIdQueryHandler,
  GetMessageByIdQueryHandler,
  GetMessagesInConversationQueryHandler,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/messaging-service/.env.local',
    }),
    DynamicDatabaseModule.forRoot('messaging'),
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      ConversationParticipant,
      ReadReceipt,
      OutboxEntity,
    ]),
    OutboxModule,
    CqrsModule,
    HttpModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [
    ConversationsController,
    MessagesController,
    UploadController,
    MessagingMicroserviceController,
  ],
  providers: [
    MessagingGateway,
    GcsStorageService,
    { provide: ITransactionService, useClass: TransactionService },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class MessagingModule {}
