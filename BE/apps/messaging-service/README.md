# Messaging Service

Real-time messaging service for the Artium platform, built with NestJS, Socket.IO, and PostgreSQL.

## Features

- **Real-time Messaging**: WebSocket-based instant messaging with Socket.IO
- **REST API**: Complete CRUD operations for messages and conversations
- **Conversation Types**: Support for direct, group, event, and inquiry conversations
- **Message Types**: Text, images, videos, audio, files, artwork shares, moodboard shares, event invites, and system messages
- **Read Receipts**: Track message delivery and read status
- **File Upload**: Support for media and document uploads
- **CQRS Pattern**: Command Query Responsibility Segregation architecture
- **TypeORM**: Database management with PostgreSQL
- **Validation**: Request validation with class-validator
- **CORS**: Configured for frontend integration

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL with TypeORM
- **Real-time**: Socket.IO
- **Architecture**: CQRS (Command Query Responsibility Segregation)
- **Validation**: class-validator
- **File Upload**: Multer

## API Endpoints

### REST API

All endpoints are prefixed with `/api`

#### Conversations

```
GET    /api/conversations/user/:userId
       Get all conversations for a user

GET    /api/conversations/:conversationId?userId=:userId
       Get conversation details by ID

POST   /api/conversations
       Create a new conversation
       Body: { creatorId: string, memberIds: string[] }

GET    /api/conversations/:conversationId/messages?userId=:userId&limit=50&offset=0
       Get messages in a conversation

POST   /api/conversations/:conversationId/participants
       Add participants to a conversation (TODO)
       Body: { actorId: string, newUserIds: string[] }
```

#### Messages

```
GET    /api/messages/:messageId?userId=:userId
       Get message by ID

POST   /api/messages
       Send a new message
       Body: { senderId: string, conversationId: string, content?: string, mediaUrl?: string }

PUT    /api/messages/:messageId
       Update a message
       Body: { userId: string, content: string }

DELETE /api/messages/:messageId
       Delete a message
       Body: { userId: string }

POST   /api/messages/read
       Mark message as read
       Body: { messageId: string, userId: string }
```

#### Upload

```
POST   /api/upload
       Upload a file
       Body: FormData with 'file' field
       Returns: { url: string, filename: string, size: number, mimetype: string }
```

### WebSocket Events

Connect to: `ws://localhost:3004` (or configured port)

#### Client → Server Events

```typescript
// Join a conversation room
socket.emit('joinRoom', conversationId: string);

// Leave a conversation room
socket.emit('leaveRoom', conversationId: string);

// Send a message
socket.emit('sendMessage', {
  conversationId: string,
  content?: string,
  media?: Buffer
});

// Notify typing started
socket.emit('typingStarted', conversationId: string);

// Notify typing stopped
socket.emit('typingStopped', conversationId: string);
```

#### Server → Client Events

```typescript
// New message received
socket.on('newMessage', (message: Message) => {});

// User started typing
socket.on('typingStarted', ({ conversationId, user }) => {});

// User stopped typing
socket.on('typingStopped', ({ conversationId, user }) => {});
```

## Database Schema

### Entities

#### Conversation
- `id`: UUID (Primary Key)
- `name`: String (nullable)
- `isGroup`: Boolean
- `type`: Enum (DIRECT, GROUP, EVENT_CHAT, INQUIRY)
- `relatedEntityType`: String (nullable)
- `relatedEntityId`: String (nullable)
- `description`: String (nullable)
- `imageUrl`: String (nullable)
- `createdBy`: String (nullable)
- `messageCount`: Number
- `lastMessageContent`: String (nullable)
- `lastMessageSenderId`: String (nullable)
- `lastMessageAt`: Date (nullable)
- `isArchived`: Boolean
- `isActive`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

#### Message
- `id`: UUID (Primary Key)
- `content`: Text (nullable)
- `type`: Enum (TEXT, IMAGE, VIDEO, AUDIO, FILE, ARTWORK_SHARE, MOODBOARD_SHARE, EVENT_INVITE, SYSTEM)
- `mediaUrl`: String (nullable)
- `senderId`: String
- `conversationId`: String (Foreign Key)
- `replyToMessageId`: String (nullable)
- `metadata`: JSONB (nullable)
- `mentionedUserIds`: JSONB (nullable)
- `isEdited`: Boolean
- `editedAt`: Date (nullable)
- `isDeleted`: Boolean
- `deletedAt`: Date (nullable)
- `reactions`: JSONB (nullable)
- `createdAt`: Date
- `updatedAt`: Date

#### ConversationParticipant
- `id`: UUID (Primary Key)
- `userId`: String
- `conversationId`: String (Foreign Key)
- `createdAt`: Date

#### ReadReceipt
- `id`: UUID (Primary Key)
- `conversationId`: String
- `messageId`: String (Foreign Key)
- `userId`: String
- `readAt`: Date
- `deliveredAt`: Date (nullable)
- `createdAt`: Date

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Yarn

### Setup

1. **Install dependencies**
   ```bash
   cd BE
   yarn install
   ```

2. **Configure environment**
   ```bash
   cp apps/messaging-service/.env.example apps/messaging-service/.env.local
   ```
   
   Update `.env.local` with your database credentials and configuration.

3. **Create database**
   ```bash
   createdb artwork_messaging
   ```

4. **Run database migrations**
   
   TypeORM synchronize is enabled for development. Tables will be created automatically on first run.

## Development

### Start the service

```bash
# From BE directory
yarn dev:messaging

# Or run all services
yarn dev:all
```

The service will start on `http://localhost:3004` (or configured port)

### Watch mode

The service runs in watch mode by default with HMR (Hot Module Replacement).

## Project Structure

```
apps/messaging-service/
├── src/
│   ├── application/              # Application layer (CQRS)
│   │   ├── commands/            # Command handlers
│   │   │   ├── handlers/
│   │   │   │   ├── CreateConversation.command.handler.ts
│   │   │   │   ├── PostMessage.command.handler.ts
│   │   │   │   ├── UpdateMessage.command.handler.ts
│   │   │   │   ├── DeleteMessage.command.handler.ts
│   │   │   │   └── MarkMessageAsRead.command.handler.ts
│   │   │   ├── CreateConversation.command.ts
│   │   │   ├── PostMessage.command.ts
│   │   │   ├── UpdateMessage.command.ts
│   │   │   ├── DeleteMessage.command.ts
│   │   │   └── MarkMessageAsRead.command.ts
│   │   ├── queries/             # Query handlers
│   │   │   ├── handlers/
│   │   │   │   ├── GetConversationsForUser.query.handler.ts
│   │   │   │   ├── GetConversationById.query.handler.ts
│   │   │   │   ├── GetMessagesInConversation.query.handler.ts
│   │   │   │   └── GetMessageById.query.handler.ts
│   │   │   ├── GetConversationsForUser.query.ts
│   │   │   ├── GetConversationById.query.ts
│   │   │   ├── GetMessagesInConversation.query.ts
│   │   │   └── GetMessageById.query.ts
│   │   └── messaging.service.ts # Legacy service (can be removed)
│   │
│   ├── domain/                   # Domain layer
│   │   ├── entities/
│   │   │   ├── conversation.entity.ts
│   │   │   ├── conversation-participant.entity.ts
│   │   │   ├── message.entity.ts
│   │   │   ├── message-attachment.entity.ts (not used yet)
│   │   │   ├── read-receipt.entity.ts
│   │   │   └── typing-indicator.entity.ts (not used yet)
│   │   └── dtos/
│   │
│   ├── presentation/             # Presentation layer
│   │   ├── http/
│   │   │   └── controllers/
│   │   │       ├── conversations.controller.ts
│   │   │       ├── messages.controller.ts
│   │   │       └── upload.controller.ts
│   │   └── gateways/
│   │       └── messaging.gateway.ts
│   │
│   ├── infrastructure/           # Infrastructure layer
│   │   └── repositories/        # (not used, using TypeORM directly)
│   │
│   ├── app.module.ts            # Main module
│   └── main.ts                  # Bootstrap
│
├── uploads/                      # File uploads directory
├── .env.example                 # Environment template
├── .env.local                   # Environment config (gitignored)
├── Dockerfile                   # Docker configuration
└── README.md                    # This file
```

## CQRS Architecture

### Commands (Write Operations)

- **CreateConversationCommand**: Create a new conversation
- **PostMessageCommand**: Send a message
- **UpdateMessageCommand**: Edit a message
- **DeleteMessageCommand**: Delete a message
- **MarkMessageAsReadCommand**: Mark message as read

### Queries (Read Operations)

- **GetConversationsForUserQuery**: Get user's conversations
- **GetConversationByIdQuery**: Get conversation details
- **GetMessagesInConversationQuery**: Get messages in conversation
- **GetMessageByIdQuery**: Get message by ID

### Benefits

- **Separation of Concerns**: Clear separation between read and write operations
- **Scalability**: Can scale read and write operations independently
- **Testability**: Easy to test commands and queries independently
- **Maintainability**: Clear structure and responsibilities

## Security

### Authentication

Currently uses a simple auth object from WebSocket handshake. In production:

1. Implement JWT authentication middleware
2. Validate tokens on WebSocket connection
3. Add guards to REST controllers
4. Implement role-based access control

### Authorization

- Users can only access conversations they're participants in
- Users can only edit/delete their own messages
- Validation at handler level

### Input Validation

- Request validation using class-validator
- File type and size restrictions
- Sanitization of user inputs

## File Upload

### Configuration

- **Max file size**: 10MB (configurable)
- **Allowed types**: Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM), Documents (PDF, DOC, DOCX)
- **Storage**: Local filesystem (./uploads)

### Production Recommendations

1. Use cloud storage (S3, GCS, Azure Blob)
2. Implement CDN for media delivery
3. Add image optimization/resizing
4. Implement virus scanning
5. Add storage quotas per user

## Testing

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov

# E2E tests
yarn test:e2e
```

## Deployment

### Docker

```bash
# Build image
docker build -t messaging-service .

# Run container
docker run -p 3004:3004 --env-file .env.local messaging-service
```

### Environment Variables

See `.env.example` for required environment variables.

## Troubleshooting

### WebSocket connection fails

1. Check CORS configuration in `main.ts`
2. Verify WebSocket port is not blocked
3. Check firewall settings
4. Verify frontend is connecting to correct URL

### File upload fails

1. Check `uploads` directory exists and is writable
2. Verify file size is within limits
3. Check file type is allowed
4. Verify disk space available

### Database connection fails

1. Verify PostgreSQL is running
2. Check database credentials in `.env.local`
3. Ensure database exists
4. Check network connectivity

### Messages not appearing in real-time

1. Verify WebSocket connection is established
2. Check users are in the same conversation room
3. Review browser console for errors
4. Check backend logs

## Future Enhancements

- [ ] Message reactions (partially implemented)
- [ ] Message threading
- [ ] Voice messages
- [ ] Video calls
- [ ] Message forwarding
- [ ] Message search
- [ ] Push notifications
- [ ] Presence tracking
- [ ] Message encryption
- [ ] Conversation archiving
- [ ] Bulk operations
- [ ] Analytics/metrics
- [ ] Rate limiting
- [ ] Message queue for offline users
- [ ] Horizontal scaling with Redis adapter

## License

Proprietary - Part of Artium project
