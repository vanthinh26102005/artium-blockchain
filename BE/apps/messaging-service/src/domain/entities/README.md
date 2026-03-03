# Messaging Service Entities

This document describes all entities in the messaging-service and their relationships.

## Entities Overview

### 1. Conversation
**Purpose:** Chat conversations (direct messages, group chats, event discussions, artwork inquiries)

**Fields:**
- `id` (PK) - Unique identifier
- **Basic Information:**
  - `name` - Conversation name (for groups)
  - `isGroup` - Group conversation flag
  - `type` - Conversation type (DIRECT, GROUP, EVENT_CHAT, INQUIRY)
  - `description` - Conversation description
  - `imageUrl` - Group/event chat image
- **Contextual Reference (Polymorphic):**
  - `relatedEntityType` - Entity type (EVENT, ARTWORK)
  - `relatedEntityId` - Entity ID
- **Creator:**
  - `createdBy` - Reference to identity-service User (creator)
- **Denormalized Metrics:**
  - `messageCount` - Total message count
  - `lastMessageContent` - Last message preview
  - `lastMessageSenderId` - Last message sender
  - `lastMessageAt` - Last message timestamp
- **Status:**
  - `isArchived` - Archived status
  - `isActive` - Active status

**Relationships:**
- **→ User** (Cross-service): Via `createdBy` UUID reference
- **→ Event** (Cross-service, optional): Via `relatedEntityId` when `relatedEntityType='EVENT'`
- **→ Artwork** (Cross-service, optional): Via `relatedEntityId` when `relatedEntityType='ARTWORK'`
- **← ConversationParticipant[]** (One-to-Many): Participants in conversation
- **← Message[]** (One-to-Many): Messages in conversation

**Indexes:**
- Composite: `(type, updatedAt)`

**Conversation Types:**
- DIRECT - One-on-one conversation
- GROUP - Group chat
- EVENT_CHAT - Event-related discussion
- INQUIRY - Artwork inquiry conversation

**Polymorphic Pattern:**
- Uses `relatedEntityType` + `relatedEntityId` for contextual reference
- No foreign key constraints (cross-service reference)
- Only for metadata/context, not queried

---

### 2. ConversationParticipant
**Purpose:** Junction table linking users to conversations

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User
- `conversationId` - Reference to Conversation (same service)
- `createdAt` - When user joined

**Relationships:**
- **→ Conversation** (Same-service): Via `conversationId` with TypeORM relationship
- **→ User** (Cross-service): Via `userId` UUID reference

**Indexes:**
- Single: `userId`, `conversationId`
- Unique: `(conversationId, userId)` - User joins conversation once

**Usage:**
- Direct messages: 2 participants
- Group chats: Multiple participants
- Event chats: Event attendees auto-added as participants
- Inquiry: Buyer + Seller

---

### 3. Message
**Purpose:** Individual messages within conversations

**Fields:**
- `id` (PK) - Unique identifier
- `conversationId` - Reference to Conversation (same service)
- `senderId` - Reference to identity-service User
- **Content:**
  - `content` - Message text content
  - `type` - Message type (TEXT, IMAGE, VIDEO, ARTWORK_SHARE, etc.)
  - `mediaUrl` - Media URL for attachments
- **Threading:**
  - `replyToMessageId` - Reply to message ID
- **Rich Content:**
  - `metadata` - Rich content metadata (JSONB)
    - `artworkId`, `artworkTitle`, `artworkImage`
    - `moodboardId`, `eventId`
    - `fileName`, `fileSize`, `duration`
- **Social:**
  - `mentionedUserIds` - Mentioned users (JSONB array)
  - `reactions` - Emoji reactions (JSONB array)
- **Status:**
  - `isEdited` - Edited flag
  - `editedAt` - Edit timestamp
  - `isDeleted` - Soft delete flag
  - `deletedAt` - Deletion timestamp

**Relationships:**
- **→ Conversation** (Same-service): Via `conversationId` with TypeORM relationship
- **→ User** (Cross-service): Via `senderId` UUID reference
- **→ Message** (Same-service, optional): Via `replyToMessageId` (threaded replies)
- **← MessageAttachment[]** (One-to-Many): File attachments
- **← ReadReceipt[]** (One-to-Many): Read receipts

**Indexes:**
- Composite: `(conversationId, createdAt)` - Conversation message history
- Single: `senderId` - User's sent messages

**Message Types:**
- TEXT - Plain text message
- IMAGE - Image attachment
- VIDEO - Video attachment
- AUDIO - Audio/voice message
- FILE - File attachment
- ARTWORK_SHARE - Shared artwork
- MOODBOARD_SHARE - Shared moodboard
- EVENT_INVITE - Event invitation
- SYSTEM - System message

**JSON Arrays (Why kept as JSONB):**
- `mentionedUserIds` - Part of message content, no reverse queries needed
- `reactions` - Embedded data, bounded size, no complex queries

---

### 4. MessageAttachment
**Purpose:** File attachments for messages

**Fields:**
- `id` (PK) - Unique identifier
- `messageId` - Reference to Message (same service)
- `conversationId` - Reference to Conversation (same service)
- **File Information:**
  - `type` - Attachment type (IMAGE, VIDEO, AUDIO, DOCUMENT, ARTWORK, MOODBOARD)
  - `url` - File URL
  - `thumbnailUrl` - Thumbnail URL
  - `fileName` - Original filename
  - `fileSize` - File size in bytes
  - `mimeType` - MIME type
- **Media Dimensions:**
  - `width` - Image/video width
  - `height` - Image/video height
  - `duration` - Audio/video duration (seconds)
- **Entity References:**
  - `artworkId` - Reference to artwork-service Artwork
  - `moodboardId` - Reference to community-service Moodboard
- **Metadata:**
  - `metadata` - Additional metadata (JSONB)
    - Cached artwork/moodboard info for display

**Relationships:**
- **→ Message** (Same-service): Via `messageId`
- **→ Conversation** (Same-service): Via `conversationId`
- **→ Artwork** (Cross-service, optional): Via `artworkId` UUID reference
- **→ Moodboard** (Cross-service, optional): Via `moodboardId` UUID reference

**Indexes:**
- Single: `messageId`

**Attachment Types:**
- IMAGE - Image file
- VIDEO - Video file
- AUDIO - Audio/voice file
- DOCUMENT - Document (PDF, etc.)
- ARTWORK - Artwork share
- MOODBOARD - Moodboard share

---

### 5. ReadReceipt
**Purpose:** Tracks when users read messages

**Fields:**
- `id` (PK) - Unique identifier
- `conversationId` - Reference to Conversation (same service)
- `messageId` - Reference to Message (same service)
- `userId` - Reference to identity-service User
- `readAt` - Read timestamp
- `deliveredAt` - Delivery timestamp

**Relationships:**
- **→ Conversation** (Same-service): Via `conversationId`
- **→ Message** (Same-service): Via `messageId`
- **→ User** (Cross-service): Via `userId` UUID reference

**Indexes:**
- Composite: `(conversationId, userId)`
- Unique: `(messageId, userId)` - One receipt per user per message

**Usage:**
- Track message delivery and read status
- Display "read by X users" in group chats
- Show double checkmarks in UI

---

### 6. TypingIndicator
**Purpose:** Real-time typing indicators for conversations

**Fields:**
- `id` (PK) - Unique identifier
- `conversationId` - Reference to Conversation (same service)
- `userId` - Reference to identity-service User
- `isTyping` - Typing status
- `expiresAt` - Expiration timestamp

**Relationships:**
- **→ Conversation** (Same-service): Via `conversationId`
- **→ User** (Cross-service): Via `userId` UUID reference

**Indexes:**
- Unique: `(conversationId, userId)`
- Single: `expiresAt` - Cleanup expired indicators

**Usage:**
- Show "User is typing..." in UI
- Auto-expires after 5-10 seconds
- Cleaned up by cron job

---

## Cross-Service References

**This service references:**

| External Service | Entity | Field | Purpose |
|------------------|--------|-------|---------|
| identity-service | User | `createdBy` | Conversation creator |
| identity-service | User | `userId` | Participant/sender |
| events-service | Event | `relatedEntityId` | Event chat context |
| artwork-service | Artwork | `relatedEntityId` | Inquiry context |
| artwork-service | Artwork | `artworkId` | Artwork attachment |
| community-service | Moodboard | `moodboardId` | Moodboard attachment |

**This service is referenced by:**
- No external services currently reference messaging entities

---

## Messaging Flows

### 1. Direct Message (One-on-One)

```typescript
// Step 1: Create or find existing conversation
const existingConversation = await findDirectConversation(user1Id, user2Id);

if (!existingConversation) {
  const conversation = await createConversation({
    type: ConversationType.DIRECT,
    isGroup: false,
    createdBy: user1Id
  });

  // Step 2: Add both participants
  await addParticipants(conversation.id, [
    { userId: user1Id },
    { userId: user2Id }
  ]);
}

// Step 3: Send message
const message = await sendMessage({
  conversationId: conversation.id,
  senderId: user1Id,
  content: "Hello!",
  type: MessageType.TEXT
});

// Step 4: Update conversation metadata
conversation.lastMessageContent = message.content;
conversation.lastMessageSenderId = user1Id;
conversation.lastMessageAt = new Date();
conversation.messageCount++;

// Step 5: Create read receipt for sender
await createReadReceipt({
  conversationId: conversation.id,
  messageId: message.id,
  userId: user1Id,
  readAt: new Date()
});

// Step 6: Send push notification to recipient
await notificationsClient.send({
  userId: user2Id,
  type: 'NEW_MESSAGE',
  title: `${sender.name} sent you a message`,
  body: message.content
});
```

### 2. Group Chat

```typescript
// Step 1: Create group conversation
const conversation = await createConversation({
  name: "Art Collectors Group",
  type: ConversationType.GROUP,
  isGroup: true,
  description: "Discussion for contemporary art collectors",
  imageUrl: "https://...",
  createdBy: adminUserId
});

// Step 2: Add participants
const participantIds = ['user1', 'user2', 'user3', 'user4'];
for (const userId of participantIds) {
  await addParticipant({
    conversationId: conversation.id,
    userId
  });
}

// Step 3: Send welcome system message
await sendMessage({
  conversationId: conversation.id,
  senderId: null, // System message
  type: MessageType.SYSTEM,
  content: "Group created by Admin"
});

// Step 4: User sends message
const message = await sendMessage({
  conversationId: conversation.id,
  senderId: 'user1',
  content: "Welcome everyone!",
  type: MessageType.TEXT
});

// Step 5: Track read receipts for each participant
for (const participant of participants) {
  // Will be created when each user opens the chat
}
```

### 3. Artwork Inquiry

```typescript
// Step 1: Create inquiry conversation
const conversation = await createConversation({
  type: ConversationType.INQUIRY,
  isGroup: false,
  relatedEntityType: 'ARTWORK',
  relatedEntityId: artwork.id,
  createdBy: buyerId
});

// Step 2: Add buyer and seller as participants
await addParticipants(conversation.id, [
  { userId: buyerId },
  { userId: artwork.sellerId }
]);

// Step 3: Send initial inquiry with artwork reference
const message = await sendMessage({
  conversationId: conversation.id,
  senderId: buyerId,
  content: "Is this artwork still available?",
  type: MessageType.ARTWORK_SHARE,
  metadata: {
    artworkId: artwork.id,
    artworkTitle: artwork.title,
    artworkImage: artwork.coverImageUrl
  }
});

// Step 4: Create attachment for artwork
await createAttachment({
  messageId: message.id,
  conversationId: conversation.id,
  type: AttachmentType.ARTWORK,
  artworkId: artwork.id,
  url: artwork.coverImageUrl,
  metadata: {
    artworkTitle: artwork.title,
    artworkPrice: artwork.price,
    artworkImage: artwork.coverImageUrl
  }
});

// Step 5: Notify seller of inquiry
await notificationsClient.send({
  userId: artwork.sellerId,
  type: 'ARTWORK_INQUIRY',
  title: 'New artwork inquiry',
  body: `${buyer.name} asked about "${artwork.title}"`
});
```

### 4. Event Chat

```typescript
// Step 1: Create event chat when event is created
const conversation = await createConversation({
  name: event.title,
  type: ConversationType.EVENT_CHAT,
  isGroup: true,
  relatedEntityType: 'EVENT',
  relatedEntityId: event.eventId,
  description: `Chat for ${event.title}`,
  imageUrl: event.coverImageUrl,
  createdBy: event.creatorId
});

// Step 2: Auto-add participants when users RSVP
// This happens in events-service after RSVP creation
await addParticipant({
  conversationId: conversation.id,
  userId: rsvp.userId
});

// Step 3: Send event updates as system messages
await sendMessage({
  conversationId: conversation.id,
  senderId: null,
  type: MessageType.SYSTEM,
  content: `Event starts in 1 hour!`,
  metadata: {
    eventId: event.eventId
  }
});

// Step 4: Users can chat about event
const message = await sendMessage({
  conversationId: conversation.id,
  senderId: attendeeId,
  content: "Looking forward to this!",
  type: MessageType.TEXT
});
```

### 5. Message with Attachments

```typescript
// Step 1: Upload file to S3
const fileUrl = await uploadToS3(file);
const thumbnailUrl = await generateThumbnail(file);

// Step 2: Send message
const message = await sendMessage({
  conversationId: conversation.id,
  senderId: userId,
  content: "Check out this artwork!",
  type: MessageType.IMAGE,
  mediaUrl: fileUrl
});

// Step 3: Create attachment record
await createAttachment({
  messageId: message.id,
  conversationId: conversation.id,
  type: AttachmentType.IMAGE,
  url: fileUrl,
  thumbnailUrl,
  fileName: file.originalName,
  fileSize: file.size,
  mimeType: file.mimeType,
  width: imageMetadata.width,
  height: imageMetadata.height
});

// Step 4: Update conversation
conversation.lastMessageContent = "📷 Photo";
conversation.lastMessageAt = new Date();
```

### 6. Typing Indicators

```typescript
// Client sends typing event via WebSocket
// Step 1: Create/update typing indicator
await upsertTypingIndicator({
  conversationId,
  userId,
  isTyping: true,
  expiresAt: new Date(Date.now() + 5000) // 5 seconds
});

// Step 2: Broadcast to other participants via WebSocket
io.to(conversationId).emit('user-typing', {
  conversationId,
  userId,
  isTyping: true
});

// Step 3: Auto-expire after 5 seconds
// Cleanup cron job runs every 10 seconds
await deleteExpiredTypingIndicators();

// Step 4: When user sends message, clear indicator
await upsertTypingIndicator({
  conversationId,
  userId,
  isTyping: false
});
```

### 7. Read Receipts

```typescript
// When user opens a conversation
// Step 1: Get all unread messages
const unreadMessages = await getUnreadMessages(conversationId, userId);

// Step 2: Mark all as read
for (const message of unreadMessages) {
  await createReadReceipt({
    conversationId,
    messageId: message.id,
    userId,
    readAt: new Date(),
    deliveredAt: message.createdAt // Already delivered
  });
}

// Step 3: Broadcast read status to sender via WebSocket
io.to(senderId).emit('message-read', {
  messageId: message.id,
  readBy: userId,
  readAt: new Date()
});

// Step 4: Update UI to show checkmarks
// Single checkmark: Delivered
// Double checkmark: Read
```

---

## Real-Time Features (WebSocket)

### WebSocket Events

**Client → Server:**
- `send-message` - Send new message
- `start-typing` - User starts typing
- `stop-typing` - User stops typing
- `mark-as-read` - Mark messages as read
- `join-conversation` - Join conversation room

**Server → Client:**
- `new-message` - New message in conversation
- `user-typing` - User typing indicator
- `user-stopped-typing` - User stopped typing
- `message-read` - Message read by user
- `message-edited` - Message edited
- `message-deleted` - Message deleted
- `participant-joined` - New participant joined
- `participant-left` - Participant left

### WebSocket Rooms

```typescript
// Join conversation room
socket.on('join-conversation', async ({ conversationId, userId }) => {
  // Verify participant
  const isParticipant = await verifyParticipant(conversationId, userId);
  if (!isParticipant) {
    return socket.emit('error', 'Not a participant');
  }

  // Join room
  socket.join(`conversation:${conversationId}`);

  // Notify others
  io.to(`conversation:${conversationId}`).emit('participant-joined', {
    conversationId,
    userId
  });
});

// Send message via WebSocket
socket.on('send-message', async (data) => {
  const message = await createMessage(data);

  // Broadcast to conversation room
  io.to(`conversation:${data.conversationId}`).emit('new-message', message);
});
```

---

## Conversation Types & Use Cases

### Direct Messages (DIRECT)
- One-on-one conversations
- Buyer-seller discussions
- Artist collaborations
- Private communication

**Features:**
- Always 2 participants
- No conversation name (use participant names)
- Read receipts visible
- Typing indicators

### Group Chats (GROUP)
- Community discussions
- Collector groups
- Artist collectives
- Topic-based chats

**Features:**
- Multiple participants (3+)
- Custom conversation name and image
- Admin can add/remove participants
- Group typing indicators ("3 people typing...")

### Event Chat (EVENT_CHAT)
- Linked to specific events
- Auto-created with event
- Participants auto-added on RSVP
- System messages for event updates

**Features:**
- Context-aware (event details always visible)
- Auto-populate participants from RSVPs
- Event organizer can post updates
- Archived after event ends

### Artwork Inquiry (INQUIRY)
- Buyer asking about artwork
- Always buyer + seller
- Artwork context visible
- Can transition to order

**Features:**
- Artwork preview in chat
- Quick actions (Make offer, Purchase)
- Tracked for analytics
- Linked to orders if purchase happens

---

## Analytics & Reporting

### Conversation Metrics

```typescript
const analytics = {
  conversations: {
    total: await getConversationCount(),
    byType: await getConversationCountByType(),
    active: await getActiveConversationCount(30), // Last 30 days
    avgMessagesPerConversation: await getAvgMessageCount()
  },
  messages: {
    total: await getMessageCount(),
    byType: await getMessageCountByType(),
    avgPerDay: await getAvgMessagesPerDay(),
    mediaMessages: await getMediaMessageCount()
  },
  engagement: {
    avgResponseTime: await getAvgResponseTime(),
    activeUsers: await getActiveUsersCount(30),
    readRate: await getReadReceiptRate()
  }
};
```

### Inquiry Conversion Tracking

```typescript
// Track inquiry → order conversion
const inquiries = await getInquiryConversations();
const conversions = [];

for (const inquiry of inquiries) {
  const order = await ordersClient.findOrderByArtwork(
    inquiry.relatedEntityId
  );

  if (order && order.buyerId === inquiry.buyerId) {
    conversions.push({
      conversationId: inquiry.id,
      artworkId: inquiry.relatedEntityId,
      inquiryDate: inquiry.createdAt,
      purchaseDate: order.createdAt,
      conversionTime: order.createdAt - inquiry.createdAt,
      orderValue: order.totalAmount
    });
  }
}

const conversionRate = (conversions.length / inquiries.length) * 100;
```

---

## Integration with Other Services

### Identity Service
- Fetch user profiles for participants
- Display avatars and names
- Check user status (online, offline)

### Events Service
- Link event chats to events
- Auto-add RSVP'd users as participants
- Send event update messages

### Artwork Service
- Display artwork in inquiry chats
- Enable artwork sharing in messages
- Show artwork availability status

### Community Service
- Share moodboards in messages
- Embed moment previews
- Link to community posts

### Notifications Service
- Send push notifications for new messages
- Email summaries of unread messages
- In-app notification badges

---

## Key Principles

1. **Real-time communication** - WebSocket for instant messaging
2. **Contextual conversations** - Link to events, artworks via polymorphic references
3. **Rich media support** - Images, videos, files, artwork shares
4. **Engagement tracking** - Read receipts, typing indicators
5. **Flexible conversation types** - Direct, group, event, inquiry
6. **JSON for embedded data** - Mentions, reactions as JSONB (no reverse queries needed)
7. **Cross-service integration** - Seamless links to other services

---

## Security & Privacy

### Message Encryption
- Messages encrypted in transit (TLS)
- Consider end-to-end encryption for sensitive conversations
- Encrypted at rest in database

### Access Control
- Users can only access conversations they're participants in
- Verify participant status on every WebSocket event
- Soft delete messages (preserve for moderation)

### Moderation
- Report inappropriate messages
- Admin can archive/disable conversations
- Automatic content filtering for spam/abuse
- Audit log for all message actions

### Data Retention
- Keep messages for 90 days
- Archive old conversations
- GDPR: Allow users to export/delete their messages
- Soft delete maintains foreign key integrity
