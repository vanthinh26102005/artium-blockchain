import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Server, Socket } from 'socket.io';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';

type AuctionRoomPayload = {
  auctionId: string;
};

type AuctionRealtimeEventType =
  | 'state_changed'
  | 'bid_updated'
  | 'extended'
  | 'ended'
  | 'cancelled';

type AuctionRealtimePatch = Partial<{
  currentBidWei: string;
  currentBidEth: number;
  minimumNextBidWei: string;
  minimumNextBidEth: number;
  minBidIncrementWei: string;
  highestBidder: string | null;
  statusKey: string;
  statusLabel: string;
  endsAt: string;
  serverTime: string;
  txHash: string | null;
  orderStatus: string | null;
  paymentStatus: string | null;
  escrowState: number | null;
}>;

type AuctionRealtimeEvent = {
  auctionId: string;
  eventType: AuctionRealtimeEventType;
  version?: number;
  emittedAt: string;
  patch?: AuctionRealtimePatch;
};

type AuctionRealtimeEventInput = Partial<
  Omit<AuctionRealtimeEvent, 'auctionId' | 'eventType' | 'emittedAt'>
> & {
  emittedAt?: string;
};

type BlockchainAuctionStartedMessage = {
  orderId: string;
};

type BlockchainNewBidMessage = {
  orderId: string;
};

type BlockchainAuctionExtendedMessage = {
  orderId: string;
};

type BlockchainAuctionEndedMessage = {
  orderId: string;
};

type BlockchainAuctionCancelledMessage = {
  orderId: string;
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

  broadcastAuctionStateChanged(
    auctionId: string,
    payload: AuctionRealtimeEventInput = {},
  ) {
    this.server
      .to(this.getAuctionRoom(auctionId))
      .emit(
        'auctionStateChanged',
        this.buildRealtimeEvent(auctionId, 'state_changed', payload),
      );
  }

  broadcastAuctionBidUpdated(
    auctionId: string,
    payload: AuctionRealtimeEventInput = {},
  ) {
    this.server
      .to(this.getAuctionRoom(auctionId))
      .emit(
        'auctionBidUpdated',
        this.buildRealtimeEvent(auctionId, 'bid_updated', payload),
      );
  }

  broadcastAuctionExtended(
    auctionId: string,
    payload: AuctionRealtimeEventInput = {},
  ) {
    this.server
      .to(this.getAuctionRoom(auctionId))
      .emit(
        'auctionExtended',
        this.buildRealtimeEvent(auctionId, 'extended', payload),
      );
  }

  broadcastAuctionEnded(
    auctionId: string,
    payload: AuctionRealtimeEventInput = {},
  ) {
    this.server
      .to(this.getAuctionRoom(auctionId))
      .emit(
        'auctionEnded',
        this.buildRealtimeEvent(auctionId, 'ended', payload),
      );
  }

  broadcastAuctionCancelled(
    auctionId: string,
    payload: AuctionRealtimeEventInput = {},
  ) {
    this.server
      .to(this.getAuctionRoom(auctionId))
      .emit(
        'auctionCancelled',
        this.buildRealtimeEvent(auctionId, 'cancelled', payload),
      );
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_STARTED,
    queue: 'api-gateway.auction-realtime.auction-started',
    queueOptions: { durable: true },
  })
  handleBlockchainAuctionStarted(message: BlockchainAuctionStartedMessage) {
    this.broadcastAuctionStateChanged(message.orderId);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_BID_NEW,
    queue: 'api-gateway.auction-realtime.bid-new',
    queueOptions: { durable: true },
  })
  handleBlockchainNewBid(message: BlockchainNewBidMessage) {
    this.broadcastAuctionBidUpdated(message.orderId);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_EXTENDED,
    queue: 'api-gateway.auction-realtime.auction-extended',
    queueOptions: { durable: true },
  })
  handleBlockchainAuctionExtended(message: BlockchainAuctionExtendedMessage) {
    this.broadcastAuctionExtended(message.orderId);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_ENDED,
    queue: 'api-gateway.auction-realtime.auction-ended',
    queueOptions: { durable: true },
  })
  handleBlockchainAuctionEnded(message: BlockchainAuctionEndedMessage) {
    this.broadcastAuctionEnded(message.orderId);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_CANCELLED,
    queue: 'api-gateway.auction-realtime.auction-cancelled',
    queueOptions: { durable: true },
  })
  handleBlockchainAuctionCancelled(message: BlockchainAuctionCancelledMessage) {
    this.broadcastAuctionCancelled(message.orderId);
  }

  private getAuctionRoom(auctionId: string) {
    return `auction:${auctionId}`;
  }

  private buildRealtimeEvent(
    auctionId: string,
    eventType: AuctionRealtimeEventType,
    payload: AuctionRealtimeEventInput,
  ): AuctionRealtimeEvent {
    return {
      auctionId,
      eventType,
      emittedAt: payload.emittedAt ?? new Date().toISOString(),
      version: payload.version,
      patch: payload.patch,
    };
  }
}
