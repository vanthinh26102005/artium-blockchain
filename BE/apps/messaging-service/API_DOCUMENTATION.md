# Messaging Service - API Documentation

Complete API reference for the Messaging Service.

## Base URL

```
REST API: http://localhost:3004/api
WebSocket: ws://localhost:3004
```

## Authentication

Currently using auth object from WebSocket handshake. In production, implement JWT authentication.

---

## REST API Endpoints

### Conversations

#### Get User's Conversations

Get all conversations for a specific user.

```http
GET /api/conversations/user/:userId
```

**Parameters:**
- `userId` (path, required): User ID

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Group Chat Name",
    "isGroup": true,
    "type": "GROUP",
    "description": "Optional description",
    "imageUrl": "https://...",
    "createdBy": "user-id",
    "messageCount": 42,
    "lastMessageContent": "Last message text",
    "lastMessageSenderId": "user-id",
    "lastMessageAt": "2024-11-11T10:00:00Z",
    "isArchived": false,
    "isActive": true,
    "createdAt": "2024-11-01T10:00:00Z",
    "updatedAt": "2024-11-11T10:00:00Z"
  }
]
```

---

#### Get Conversation by ID

Get detailed information about a specific conversation.

```http
GET /api/conversations/:conversationId?userId=:userId
```

**Parameters:**
- `conversationId` (path, required): Conversation ID
- `userId` (query, required): User ID for authorization

**Response:**
```json
{
  "id": "uuid",
  "name": "Chat Name",
  "isGroup": false,
  "type": "DIRECT",
  "participants": [
    {
      "id": "uuid",
      "userId": "user-id",
      "conversationId": "conversation-id",
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ],
  "messages": [...],
  "createdAt": "2024-11-01T10:00:00Z",
  "updatedAt": "2024-11-11T10:00:00Z"
}
```

**Errors:**
- `403 Forbidden`: User is not a participant in the conversation
- `404 Not Found`: Conversation not found

---

#### Create Conversation

Create a new conversation between users.

```http
POST /api/conversations
Content-Type: application/json
```

**Request Body:**
```json
{
  "creatorId": "user-id",
  "memberIds": ["user-id-2", "user-id-3"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "isGroup": true,
  "type": "DIRECT",
  "createdBy": "user-id",
  "createdAt": "2024-11-11T10:00:00Z",
  "updatedAt": "2024-11-11T10:00:00Z",
  ...
}
```

---

#### Get Messages in Conversation

Get messages from a specific conversation with pagination.

```http
GET /api/conversations/:conversationId/messages?userId=:userId&limit=50&offset=0
```

**Parameters:**
- `conversationId` (path, required): Conversation ID
- `userId` (query, required): User ID for authorization
- `limit` (query, optional): Number of messages to return (default: 50)
- `offset` (query, optional): Offset for pagination (default: 0)

**Response:**
```json
[
  {
    "id": "uuid",
    "content": "Message text",
    "type": "TEXT",
    "mediaUrl": null,
    "senderId": "user-id",
    "conversationId": "conversation-id",
    "replyToMessageId": null,
    "metadata": {},
    "mentionedUserIds": [],
    "isEdited": false,
    "editedAt": null,
    "isDeleted": false,
    "deletedAt": null,
    "reactions": [
      {
        "userId": "user-id",
        "emoji": "👍",
        "createdAt": "2024-11-11T10:00:00Z"
      }
    ],
    "createdAt": "2024-11-11T10:00:00Z",
    "updatedAt": "2024-11-11T10:00:00Z"
  }
]
```

**Note:** Messages are returned in ascending order (oldest first) for chat display.

**Errors:**
- `403 Forbidden`: User is not a participant in the conversation

---

### Messages

#### Get Message by ID

Get a specific message by its ID.

```http
GET /api/messages/:messageId?userId=:userId
```

**Parameters:**
- `messageId` (path, required): Message ID
- `userId` (query, required): User ID for authorization

**Response:**
```json
{
  "id": "uuid",
  "content": "Message text",
  "type": "TEXT",
  "senderId": "user-id",
  "conversationId": "conversation-id",
  "createdAt": "2024-11-11T10:00:00Z",
  ...
}
```

**Errors:**
- `403 Forbidden`: User is not a participant in the conversation
- `404 Not Found`: Message not found

---

#### Send Message

Send a new message to a conversation.

```http
POST /api/messages
Content-Type: application/json
```

**Request Body:**
```json
{
  "senderId": "user-id",
  "conversationId": "conversation-id",
  "content": "Message text",
  "mediaUrl": "https://example.com/image.jpg"
}
```

**Note:** Either `content` or `mediaUrl` must be provided.

**Response:**
```json
{
  "id": "uuid",
  "content": "Message text",
  "type": "TEXT",
  "mediaUrl": "https://example.com/image.jpg",
  "senderId": "user-id",
  "conversationId": "conversation-id",
  "createdAt": "2024-11-11T10:00:00Z",
  "updatedAt": "2024-11-11T10:00:00Z"
}
```

---

#### Update Message

Edit an existing message.

```http
PUT /api/messages/:messageId
Content-Type: application/json
```

**Parameters:**
- `messageId` (path, required): Message ID

**Request Body:**
```json
{
  "userId": "user-id",
  "content": "Updated message text"
}
```

**Response:**
```json
{
  "id": "uuid",
  "content": "Updated message text",
  "isEdited": true,
  "editedAt": "2024-11-11T10:05:00Z",
  ...
}
```

**Errors:**
- `403 Forbidden`: Only the message sender can update the message
- `404 Not Found`: Message not found

---

#### Delete Message

Delete a message.

```http
DELETE /api/messages/:messageId
Content-Type: application/json
```

**Parameters:**
- `messageId` (path, required): Message ID

**Request Body:**
```json
{
  "userId": "user-id"
}
```

**Response:**
- Status: `200 OK` (empty body)

**Errors:**
- `403 Forbidden`: Only the message sender can delete the message
- `404 Not Found`: Message not found

---

#### Mark Message as Read

Mark a message as read by the current user.

```http
POST /api/messages/read
Content-Type: application/json
```

**Request Body:**
```json
{
  "messageId": "message-id",
  "userId": "user-id"
}
```

**Response:**
```json
{
  "id": "uuid",
  "conversationId": "conversation-id",
  "messageId": "message-id",
  "userId": "user-id",
  "readAt": "2024-11-11T10:00:00Z",
  "deliveredAt": "2024-11-11T10:00:00Z",
  "createdAt": "2024-11-11T10:00:00Z"
}
```

**Errors:**
- `403 Forbidden`: Cannot mark your own message as read
- `404 Not Found`: Message not found

---

### File Upload

#### Upload File

Upload a media file or document.

```http
POST /api/upload
Content-Type: multipart/form-data
```

**Request Body:**
- `file` (file, required): File to upload

**Supported File Types:**
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM
- Documents: PDF, DOC, DOCX

**Max File Size:** 10MB

**Response:**
```json
{
  "url": "/uploads/abc123-def456.jpg",
  "filename": "original-filename.jpg",
  "size": 1024000,
  "mimetype": "image/jpeg"
}
```

**Errors:**
- `400 Bad Request`: No file uploaded or invalid file type
- `413 Payload Too Large`: File exceeds size limit

---

## WebSocket API

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3004', {
  auth: {
    user: {
      id: 'user-123',
      username: 'JohnDoe',
      email: 'john@example.com'
    }
  }
});
```

---

### Client → Server Events

#### Join Room

Join a conversation room to receive real-time updates.

```javascript
socket.emit('joinRoom', conversationId);
```

**Parameters:**
- `conversationId` (string): Conversation ID to join

---

#### Leave Room

Leave a conversation room.

```javascript
socket.emit('leaveRoom', conversationId);
```

**Parameters:**
- `conversationId` (string): Conversation ID to leave

---

#### Send Message

Send a message via WebSocket (alternative to REST API).

```javascript
socket.emit('sendMessage', {
  conversationId: 'conversation-id',
  content: 'Message text',
  media: bufferData // Optional: Buffer data
});
```

**Parameters:**
- `conversationId` (string): Conversation ID
- `content` (string, optional): Message text
- `media` (Buffer, optional): Binary media data

---

#### Typing Started

Notify that the user started typing.

```javascript
socket.emit('typingStarted', conversationId);
```

**Parameters:**
- `conversationId` (string): Conversation ID

---

#### Typing Stopped

Notify that the user stopped typing.

```javascript
socket.emit('typingStopped', conversationId);
```

**Parameters:**
- `conversationId` (string): Conversation ID

---

### Server → Client Events

#### New Message

Receive a new message in a conversation.

```javascript
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});
```

**Payload:**
```json
{
  "id": "uuid",
  "content": "Message text",
  "type": "TEXT",
  "senderId": "user-id",
  "conversationId": "conversation-id",
  "createdAt": "2024-11-11T10:00:00Z",
  ...
}
```

---

#### Typing Started

Receive notification that a user started typing.

```javascript
socket.on('typingStarted', ({ conversationId, user }) => {
  console.log(`${user.username} is typing in ${conversationId}`);
});
```

**Payload:**
```json
{
  "conversationId": "conversation-id",
  "user": {
    "id": "user-id",
    "username": "JohnDoe",
    "email": "john@example.com"
  }
}
```

---

#### Typing Stopped

Receive notification that a user stopped typing.

```javascript
socket.on('typingStopped', ({ conversationId, user }) => {
  console.log(`${user.username} stopped typing in ${conversationId}`);
});
```

**Payload:**
```json
{
  "conversationId": "conversation-id",
  "user": {
    "id": "user-id",
    "username": "JohnDoe",
    "email": "john@example.com"
  }
}
```

---

## Data Models

### Message Types

```typescript
enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  ARTWORK_SHARE = 'ARTWORK_SHARE',
  MOODBOARD_SHARE = 'MOODBOARD_SHARE',
  EVENT_INVITE = 'EVENT_INVITE',
  SYSTEM = 'SYSTEM'
}
```

### Conversation Types

```typescript
enum ConversationType {
  DIRECT = 'DIRECT',           // One-on-one
  GROUP = 'GROUP',             // Group chat
  EVENT_CHAT = 'EVENT_CHAT',   // Event discussion
  INQUIRY = 'INQUIRY'          // Artwork inquiry
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `413 Payload Too Large`: File too large
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently not implemented. Recommended for production:

- REST API: 100 requests/minute per user
- WebSocket: 50 messages/minute per user
- File Upload: 10 uploads/minute per user

---

## Best Practices

### REST API

1. Always include `userId` for authorization
2. Use pagination for message lists
3. Handle errors gracefully
4. Cache conversation lists
5. Validate file types before upload

### WebSocket

1. Reconnect on disconnect
2. Join rooms on connection
3. Leave rooms on disconnect
4. Implement exponential backoff for reconnection
5. Buffer messages during disconnection
6. Implement heartbeat/ping-pong

### Performance

1. Paginate message history
2. Lazy load media
3. Debounce typing indicators
4. Use optimistic UI updates
5. Implement message caching
6. Virtual scroll for long lists

---

## Testing

### REST API Testing with cURL

```bash
# Get user's conversations
curl -X GET http://localhost:3004/api/conversations/user/user-123

# Send a message
curl -X POST http://localhost:3004/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "user-123",
    "conversationId": "conv-456",
    "content": "Hello World"
  }'

# Upload a file
curl -X POST http://localhost:3004/api/upload \
  -F "file=@/path/to/image.jpg"
```

### WebSocket Testing

Use Postman, Socket.IO client, or browser console with socket.io-client library.

---

## Migration Guide

### From Legacy Service

If migrating from the old messaging service:

1. Update API endpoints to include `/api` prefix
2. Update WebSocket URL to port 3004
3. Replace user auth with JWT (when implemented)
4. Update conversation creation payload
5. Handle new message types (ARTWORK_SHARE, etc.)

---

## Changelog

### v1.0.0 (2024-11-11)

- Initial release
- REST API endpoints
- WebSocket real-time messaging
- File upload support
- Read receipts
- Typing indicators
- CQRS architecture
- PostgreSQL database
- CORS support
- Request validation

---

## Support

For issues or questions:
1. Check logs: `yarn dev:messaging`
2. Review database: Check PostgreSQL logs
3. Test endpoints: Use Postman/cURL
4. WebSocket: Use Socket.IO client for testing
