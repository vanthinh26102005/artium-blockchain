import { io, Socket } from 'socket.io-client'
import type { Message } from '@/types/messaging'

type WebSocketEventHandler = (...args: any[]) => void

export class MessagingWebSocketClient {
  private socket: Socket | null = null
  private isConnected = false

  connect(userId: string, username?: string, email?: string) {
    if (this.socket?.connected) {
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8081'

    this.socket = io(`${wsUrl}/messaging`, {
      auth: {
        user: {
          id: userId,
          username,
          email,
        },
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('WebSocket disconnected')
    })

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  joinConversation(conversationId: string) {
    if (!this.socket) return

    this.socket.emit('joinConversation', { conversationId })
  }

  leaveConversation(conversationId: string) {
    if (!this.socket) return

    this.socket.emit('leaveConversation', { conversationId })
  }

  sendMessage(conversationId: string, content?: string, mediaUrl?: string) {
    if (!this.socket) return

    this.socket.emit('sendMessage', {
      conversationId,
      content,
      mediaUrl,
    })
  }

  startTyping(conversationId: string) {
    if (!this.socket) return

    this.socket.emit('typingStarted', { conversationId })
  }

  stopTyping(conversationId: string) {
    if (!this.socket) return

    this.socket.emit('typingStopped', { conversationId })
  }

  markAsRead(messageId: string, conversationId: string) {
    if (!this.socket) return

    this.socket.emit('markAsRead', { messageId, conversationId })
  }

  onNewMessage(handler: (message: Message) => void) {
    if (!this.socket) return

    this.socket.on('newMessage', handler)
  }

  onUserTyping(handler: (data: { conversationId: string; userId: string; username?: string }) => void) {
    if (!this.socket) return

    this.socket.on('userTyping', handler)
  }

  onUserStoppedTyping(handler: (data: { conversationId: string; userId: string }) => void) {
    if (!this.socket) return

    this.socket.on('userStoppedTyping', handler)
  }

  onMessageRead(handler: (data: { messageId: string; userId: string; readAt: string }) => void) {
    if (!this.socket) return

    this.socket.on('messageRead', handler)
  }

  onConnected(handler: (data: { userId: string }) => void) {
    if (!this.socket) return

    this.socket.on('connected', handler)
  }

  off(event: string, handler?: WebSocketEventHandler) {
    if (!this.socket) return

    if (handler) {
      this.socket.off(event, handler)
    } else {
      this.socket.off(event)
    }
  }

  getConnectionStatus() {
    return this.isConnected
  }
}

export const messagingWs = new MessagingWebSocketClient()
