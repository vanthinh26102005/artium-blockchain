import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PostMessageCommand } from '../../application/commands/PostMessage.command';
import { GetConversationsForUserQuery } from '../../application/queries/GetConversationsForUser.query';

// Assume this user object is attached by an auth guard
interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust for production
  },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Socket>();

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // @UseGuards(JwtAuthGuard)
  async handleConnection(client: Socket) {
    // In a real app, a guard would handle this
    const user: AuthenticatedUser = client.handshake.auth.user;
    if (!user) {
      client.disconnect();
      return;
    }

    this.connectedUsers.set(user.id, client);

    const conversations = await this.queryBus.execute(
      new GetConversationsForUserQuery(user.id),
    );
    conversations.forEach((convo) => client.join(convo.id));

    console.log(`User ${user.username} connected`);
  }

  handleDisconnect(client: Socket) {
    const user: AuthenticatedUser = client.handshake.auth.user;
    if (user) {
      this.connectedUsers.delete(user.id);
      console.log(`User ${user.username} disconnected`);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    payload: { conversationId: string; content?: string; media?: Buffer },
    @ConnectedSocket() client: Socket,
  ) {
    const user: AuthenticatedUser = client.handshake.auth.user;
    let mediaUrl: string | undefined;

    if (payload.media) {
      // In a real app, you would use a proper client to the artwork-service
      // and handle FormData/multipart uploads.
      // For this example, we'll just simulate the call.
      // const formData = new FormData();
      // formData.append('file', payload.media);
      // const response = await axios.post('http://artwork-service/upload', formData);
      // mediaUrl = response.data.url;
      mediaUrl = 'https://example.com/placeholder.jpg'; // Placeholder
    }

    const message = await this.commandBus.execute(
      new PostMessageCommand(
        user.id,
        payload.conversationId,
        payload.content,
        mediaUrl,
      ),
    );

    this.server.to(payload.conversationId).emit('newMessage', message);
  }

  @SubscribeMessage('typingStarted')
  handleTypingStarted(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user: AuthenticatedUser = client.handshake.auth.user;
    client.to(conversationId).emit('typingStarted', { conversationId, user });
  }

  @SubscribeMessage('typingStopped')
  handleTypingStopped(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user: AuthenticatedUser = client.handshake.auth.user;
    client.to(conversationId).emit('typingStopped', { conversationId, user });
  }
}
