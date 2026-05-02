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

type AuctionRoomPayload = {
  auctionId: string;
};

@WebSocketGateway({
  namespace: '/auction',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    client.emit('connected', { namespace: 'auction' });
  }

  handleDisconnect(_client: Socket) {
    // Socket.IO handles room cleanup on disconnect.
  }

  @SubscribeMessage('joinAuction')
  handleJoinAuction(
    @MessageBody() data: AuctionRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.getAuctionRoom(data.auctionId);
    client.join(room);

    return { success: true, auctionId: data.auctionId };
  }

  @SubscribeMessage('leaveAuction')
  handleLeaveAuction(
    @MessageBody() data: AuctionRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.getAuctionRoom(data.auctionId);
    client.leave(room);

    return { success: true, auctionId: data.auctionId };
  }

  broadcastAuctionStateChanged(auctionId: string, payload: unknown) {
    this.server
      .to(this.getAuctionRoom(auctionId))
      .emit('auctionStateChanged', payload);
  }

  broadcastAuctionBidUpdated(auctionId: string, payload: unknown) {
    this.server
      .to(this.getAuctionRoom(auctionId))
      .emit('auctionBidUpdated', payload);
  }

  broadcastAuctionExtended(auctionId: string, payload: unknown) {
    this.server
      .to(this.getAuctionRoom(auctionId))
      .emit('auctionExtended', payload);
  }

  private getAuctionRoom(auctionId: string) {
    return `auction:${auctionId}`;
  }
}

// TODO Phase 17 execution: wire blockchain.bid.new, blockchain.auction.extended,
// blockchain.auction.ended, and blockchain.auction.cancelled to the broadcast
// methods above after the gateway subscribes to blockchain event messages.
