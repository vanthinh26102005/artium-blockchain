export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  EVENT_CHAT = 'EVENT_CHAT',
  INQUIRY = 'INQUIRY',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  ARTWORK_SHARE = 'ARTWORK_SHARE',
  MOODBOARD_SHARE = 'MOODBOARD_SHARE',
  EVENT_INVITE = 'EVENT_INVITE',
  SYSTEM = 'SYSTEM',
}

export type ConversationParticipant = {
  id: string
  userId: string
  conversationId: string
  joinedAt: string
  lastReadAt?: string | null
  isActive: boolean
}

export type Conversation = {
  id: string
  name?: string | null
  isGroup: boolean
  type: ConversationType
  relatedEntityType?: string | null
  relatedEntityId?: string | null
  description?: string | null
  imageUrl?: string | null
  createdBy?: string | null
  messageCount: number
  lastMessageContent?: string | null
  lastMessageSenderId?: string | null
  lastMessageAt?: string | null
  isArchived: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  participants?: ConversationParticipant[]
}

export type Message = {
  id: string
  content?: string | null
  type: MessageType
  mediaUrl?: string | null
  senderId: string
  conversationId: string
  replyToMessageId?: string | null
  metadata?: {
    artworkId?: string
    artworkTitle?: string
    artworkImage?: string
    moodboardId?: string
    eventId?: string
    fileName?: string
    fileSize?: number
    duration?: number
    [key: string]: any
  } | null
  mentionedUserIds?: string[] | null
  isEdited: boolean
  editedAt?: string | null
  isDeleted: boolean
  deletedAt?: string | null
  reactions?: Array<{
    userId: string
    emoji: string
    createdAt: string
  }> | null
  createdAt: string
  updatedAt: string
}

export type ReadReceipt = {
  id: string
  messageId: string
  userId: string
  readAt: string
  createdAt: string
}

export type CreateConversationInput = {
  participantIds: string[]
  title?: string
}

export type SendMessageInput = {
  senderId: string
  conversationId: string
  content?: string
  mediaUrl?: string
}

export type UpdateMessageInput = {
  userId: string
  content: string
}

export type MarkMessageReadInput = {
  messageId: string
  userId: string
}
