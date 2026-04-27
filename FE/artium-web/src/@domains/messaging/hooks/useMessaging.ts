import { useEffect, useState, useCallback } from 'react'
import messagingApis from '@shared/apis/messagingApis'
import { messagingWs } from '@shared/services/websocketClient'
import type { Conversation, Message } from '@/types/messaging'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'

export const useMessaging = () => {
  const user = useAuthStore((state) => state.user)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoadingConversations(true)
      setError(null)
      const data = await messagingApis.getConversationsForUser(user.id)
      setConversations(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load conversations'
      setError(message)
      console.error('Failed to load conversations:', err)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [user?.id])

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!user?.id) return

      try {
        setIsLoadingMessages(true)
        setError(null)
        const data = await messagingApis.getMessagesInConversation(conversationId, user.id, 50, 0)
        setMessages(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load messages'
        setError(message)
        console.error('Failed to load messages:', err)
      } finally {
        setIsLoadingMessages(false)
      }
    },
    [user?.id],
  )

  const sendMessage = useCallback(
    async (conversationId: string, content: string, mediaUrl?: string) => {
      if (!user?.id) return

      try {
        const message = await messagingApis.sendMessage({
          senderId: user.id,
          conversationId,
          content,
          mediaUrl,
        })

        setMessages((prev) => [...prev, message])

        messagingWs.sendMessage(conversationId, content, mediaUrl)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message'
        setError(message)
        console.error('Failed to send message:', err)
      }
    },
    [user?.id],
  )

  const updateMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!user?.id) return

      try {
        const updated = await messagingApis.updateMessage(messageId, {
          userId: user.id,
          content,
        })

        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? updated : msg)))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update message'
        setError(message)
        console.error('Failed to update message:', err)
      }
    },
    [user?.id],
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!user?.id) return

      try {
        await messagingApis.deleteMessage(messageId, user.id)

        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isDeleted: true } : msg)))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete message'
        setError(message)
        console.error('Failed to delete message:', err)
      }
    },
    [user?.id],
  )

  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      if (!user?.id) return

      try {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              const reactions = msg.reactions || []
              const existingReaction = reactions.find(
                (r) => r.userId === user.id && r.emoji === emoji,
              )

              if (existingReaction) {
                return {
                  ...msg,
                  reactions: reactions.filter((r) => r !== existingReaction),
                }
              } else {
                return {
                  ...msg,
                  reactions: [...reactions, { userId: user.id, emoji, createdAt: new Date().toISOString() }],
                }
              }
            }
            return msg
          }),
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to react to message'
        setError(message)
        console.error('Failed to react to message:', err)
      }
    },
    [user?.id],
  )

  const selectConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId)
      loadMessages(conversationId)
      messagingWs.joinConversation(conversationId)
    },
    [loadMessages],
  )

  useEffect(() => {
    if (user?.id) {
      loadConversations()

      messagingWs.connect(user.id, user.username ?? undefined, user.email ?? undefined)

      const handleNewMessage = (message: Message) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id)
          if (exists) return prev
          return [...prev, message]
        })

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === message.conversationId
              ? {
                  ...conv,
                  lastMessageContent: message.content || '',
                  lastMessageAt: message.createdAt,
                  messageCount: conv.messageCount + 1,
                }
              : conv,
          ),
        )
      }

      const handleUserTyping = (data: { conversationId: string; userId: string }) => {
        if (
          data.conversationId === selectedConversationId &&
          data.userId !== user.id &&
          !typingUsers.includes(data.userId)
        ) {
          setTypingUsers((prev) => [...prev, data.userId])
        }
      }

      const handleUserStoppedTyping = (data: { conversationId: string; userId: string }) => {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
      }

      messagingWs.onNewMessage(handleNewMessage)
      messagingWs.onUserTyping(handleUserTyping)
      messagingWs.onUserStoppedTyping(handleUserStoppedTyping)

      return () => {
        messagingWs.off('newMessage', handleNewMessage)
        messagingWs.off('userTyping', handleUserTyping)
        messagingWs.off('userStoppedTyping', handleUserStoppedTyping)
        messagingWs.disconnect()
      }
    }
  }, [user?.id, user?.username, user?.email, selectedConversationId, loadConversations])

  return {
    conversations,
    selectedConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    typingUsers,
    error,
    selectConversation,
    sendMessage,
    updateMessage,
    deleteMessage,
    reactToMessage,
    loadConversations,
  }
}
