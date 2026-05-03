import { apiFetch, apiUpload, encodePathSegment, withQuery } from '@shared/services/apiClient'
import type {
  Conversation,
  Message,
  CreateConversationInput,
  SendMessageInput,
  UpdateMessageInput,
  MarkMessageReadInput,
  ReadReceipt,
} from '@/types/messaging'

/**
 * MESSAGING_BASE_URL - React component
 * @returns React element
 */
const MESSAGING_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

const messagingApis = {
  uploadFile: async (
    file: File,
    /**
     * messagingApis - Utility function
     * @returns void
     */
  ): Promise<{
    url: string
    filename: string
    size: number
    mimetype: string
    type?: string
    isImage?: boolean
    isVideo?: boolean
  }> => {
    const formData = new FormData()
    formData.append('file', file)

    return apiUpload('/messaging/upload', formData, {
      baseUrl: MESSAGING_BASE_URL,
    })
    /**
     * formData - Utility function
     * @returns void
     */
  },

  getConversationsForUser: (userId: string) =>
    apiFetch<Conversation[]>(`/messaging/conversations/user/${encodePathSegment(userId)}`, {
      baseUrl: MESSAGING_BASE_URL,
      cache: 'no-store',
    }),

  getConversationById: (conversationId: string, userId: string) =>
    apiFetch<Conversation>(
      withQuery(`/messaging/conversations/${encodePathSegment(conversationId)}`, { userId }),
      {
        baseUrl: MESSAGING_BASE_URL,
        cache: 'no-store',
      },
    ),

  createConversation: (input: CreateConversationInput) =>
    apiFetch<Conversation>('/messaging/conversations', {
      baseUrl: MESSAGING_BASE_URL,
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getMessagesInConversation: (conversationId: string, userId: string, limit = 50, offset = 0) =>
    apiFetch<Message[]>(
      withQuery(`/messaging/conversations/${encodePathSegment(conversationId)}/messages`, {
        userId,
        limit,
        offset,
      }),
      {
        baseUrl: MESSAGING_BASE_URL,
        cache: 'no-store',
      },
    ),

  sendMessage: (input: SendMessageInput) =>
    apiFetch<Message>('/messaging/messages', {
      baseUrl: MESSAGING_BASE_URL,
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getMessageById: (messageId: string, userId: string) =>
    apiFetch<Message>(
      withQuery(`/messaging/messages/${encodePathSegment(messageId)}`, { userId }),
      {
        baseUrl: MESSAGING_BASE_URL,
        cache: 'no-store',
      },
    ),

  updateMessage: (messageId: string, input: UpdateMessageInput) =>
    apiFetch<Message>(`/messaging/messages/${encodePathSegment(messageId)}`, {
      baseUrl: MESSAGING_BASE_URL,
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteMessage: (messageId: string, userId: string) =>
    apiFetch<void>(withQuery(`/messaging/messages/${encodePathSegment(messageId)}`, { userId }), {
      baseUrl: MESSAGING_BASE_URL,
      method: 'DELETE',
    }),

  markMessageAsRead: (input: MarkMessageReadInput) =>
    apiFetch<ReadReceipt>('/messaging/messages/read', {
      baseUrl: MESSAGING_BASE_URL,
      method: 'POST',
      body: JSON.stringify(input),
    }),
}

export default messagingApis
