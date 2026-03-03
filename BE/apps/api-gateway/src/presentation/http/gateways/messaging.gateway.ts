import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ClientProxy } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';
import { MICROSERVICES } from '../../../config';

interface AuthenticatedUser {
  id: string;
  username?: string;
  email?: string;
}

@WebSocketGateway({
  namespace: '/messaging',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Socket>();

  constructor(
    @Inject(MICROSERVICES.MESSAGING_SERVICE)
    private readonly messagingClient: ClientProxy,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user: AuthenticatedUser = client.handshake.auth?.user;

      if (!user?.id) {
        console.log('Unauthorized connection attempt');
        client.disconnect();
        return;
      }

      this.connectedUsers.set(user.id, client);
      console.log(`User ${user.id} connected to messaging gateway`);

      client.emit('connected', { userId: user.id });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const user: AuthenticatedUser = client.handshake.auth?.user;
      if (user?.id) {
        this.connectedUsers.delete(user.id);
        console.log(`User ${user.id} disconnected from messaging gateway`);
      }
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user: AuthenticatedUser = client.handshake.auth?.user;
      if (!user?.id) {
        return { error: 'Unauthorized' };
      }

      client.join(data.conversationId);
      console.log(`User ${user.id} joined conversation ${data.conversationId}`);

      return { success: true, conversationId: data.conversationId };
    } catch (error) {
      console.error('Join conversation error:', error);
      return { error: 'Failed to join conversation' };
    }
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user: AuthenticatedUser = client.handshake.auth?.user;
      if (!user?.id) {
        return { error: 'Unauthorized' };
      }

      client.leave(data.conversationId);
      console.log(`User ${user.id} left conversation ${data.conversationId}`);

      return { success: true, conversationId: data.conversationId };
    } catch (error) {
      console.error('Leave conversation error:', error);
      return { error: 'Failed to leave conversation' };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    payload: {
      conversationId: string;
      content?: string;
      mediaUrl?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user: AuthenticatedUser = client.handshake.auth?.user;
      if (!user?.id) {
        return { error: 'Unauthorized' };
      }

      const message = {
        senderId: user.id,
        conversationId: payload.conversationId,
        content: payload.content,
        mediaUrl: payload.mediaUrl,
      };

      this.server.to(payload.conversationId).emit('newMessage', {
        ...message,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        type: 'TEXT',
        isEdited: false,
        isDeleted: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Send message error:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('typingStarted')
  async handleTypingStarted(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user: AuthenticatedUser = client.handshake.auth?.user;
      if (!user?.id) {
        return { error: 'Unauthorized' };
      }

      client.to(data.conversationId).emit('userTyping', {
        conversationId: data.conversationId,
        userId: user.id,
        username: user.username,
      });

      return { success: true };
    } catch (error) {
      console.error('Typing started error:', error);
      return { error: 'Failed to send typing indicator' };
    }
  }

  @SubscribeMessage('typingStopped')
  async handleTypingStopped(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user: AuthenticatedUser = client.handshake.auth?.user;
      if (!user?.id) {
        return { error: 'Unauthorized' };
      }

      client.to(data.conversationId).emit('userStoppedTyping', {
        conversationId: data.conversationId,
        userId: user.id,
      });

      return { success: true };
    } catch (error) {
      console.error('Typing stopped error:', error);
      return { error: 'Failed to send typing indicator' };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string; conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user: AuthenticatedUser = client.handshake.auth?.user;
      if (!user?.id) {
        return { error: 'Unauthorized' };
      }

      client.to(data.conversationId).emit('messageRead', {
        messageId: data.messageId,
        userId: user.id,
        readAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { error: 'Failed to mark message as read' };
    }
  }

  emitToConversation(conversationId: string, event: string, data: any) {
    this.server.to(conversationId).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }
}
