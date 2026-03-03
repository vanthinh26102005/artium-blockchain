import { apiFetch } from '@shared/services/apiClient'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import type {
  Conversation,
  Message,
  CreateConversationInput,
  SendMessageInput,
  UpdateMessageInput,
  MarkMessageReadInput,
  ReadReceipt,
} from '@/types/messaging'

const MESSAGING_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? ''
).replace(/\/$/, '')

const messagingApis = {
  uploadFile: async (
    file: File,
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

    const headers: HeadersInit = {}
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch(`${MESSAGING_BASE_URL}/messaging/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error('File upload failed')
    }

    const data = await response.json()
    return data
  },

  getConversationsForUser: (userId: string) =>
    apiFetch<Conversation[]>(`/messaging/conversations/user/${userId}`, {
      baseUrl: MESSAGING_BASE_URL,
      cache: 'no-store',
    }),

  getConversationById: (conversationId: string, userId: string) =>
    apiFetch<Conversation>(
      `/messaging/conversations/${conversationId}?userId=${userId}`,
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

  getMessagesInConversation: (
    conversationId: string,
    userId: string,
    limit = 50,
    offset = 0,
  ) =>
    apiFetch<Message[]>(
      `/messaging/conversations/${conversationId}/messages?userId=${userId}&limit=${limit}&offset=${offset}`,
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
    apiFetch<Message>(`/messaging/messages/${messageId}?userId=${userId}`, {
      baseUrl: MESSAGING_BASE_URL,
      cache: 'no-store',
    }),

  updateMessage: (messageId: string, input: UpdateMessageInput) =>
    apiFetch<Message>(`/messaging/messages/${messageId}`, {
      baseUrl: MESSAGING_BASE_URL,
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteMessage: (messageId: string, userId: string) =>
    apiFetch<void>(`/messaging/messages/${messageId}?userId=${userId}`, {
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
