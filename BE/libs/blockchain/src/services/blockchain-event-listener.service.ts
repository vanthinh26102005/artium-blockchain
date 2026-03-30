import {
  Injectable,
  Logger,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Contract } from 'ethers';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { ESCROW_CONTRACT } from '../interfaces/blockchain-config.interface';

const EVENT_ROUTING_KEYS: Record<string, string> = {
  AuctionStarted: RoutingKey.BLOCKCHAIN_AUCTION_STARTED,
  AuctionEnded: RoutingKey.BLOCKCHAIN_AUCTION_ENDED,
  NewBid: RoutingKey.BLOCKCHAIN_BID_NEW,
  ArtShipped: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPED,
  DeliveryConfirmed: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_CONFIRMED,
  DisputeOpened: RoutingKey.BLOCKCHAIN_DISPUTE_OPENED,
  DisputeResolved: RoutingKey.BLOCKCHAIN_DISPUTE_RESOLVED,
  AuctionCancelled: RoutingKey.BLOCKCHAIN_AUCTION_CANCELLED,
  ShippingTimeout: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPING_TIMEOUT,
  DeliveryTimeout: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_TIMEOUT,
  AuctionExtended: RoutingKey.BLOCKCHAIN_AUCTION_EXTENDED,
  Withdrawn: RoutingKey.BLOCKCHAIN_FUNDS_WITHDRAWN,
};

type EventPayloadExtractor = (...args: any[]) => Record<string, any>;

const EVENT_EXTRACTORS: Record<string, EventPayloadExtractor> = {
  AuctionStarted: (orderId, seller, endTime) => ({
    orderId,
    seller,
    endTime: endTime.toString(),
  }),
  NewBid: (orderId, bidder, amount) => ({
    orderId,
    bidder,
    amount: amount.toString(),
  }),
  AuctionEnded: (orderId, winner, amount) => ({
    orderId,
    winner,
    amount: amount.toString(),
  }),
  ArtShipped: (orderId, seller, trackingHash) => ({
    orderId,
    seller,
    trackingHash,
  }),
  DeliveryConfirmed: (orderId, winner) => ({
    orderId,
    winner,
  }),
  DisputeOpened: (orderId, buyer, reason) => ({
    orderId,
    buyer,
    reason,
  }),
  DisputeResolved: (orderId, arbiter, favorBuyer) => ({
    orderId,
    arbiter,
    favorBuyer,
  }),
  AuctionCancelled: (orderId, reason) => ({
    orderId,
    reason,
  }),
  ShippingTimeout: (orderId, buyer) => ({
    orderId,
    buyer,
  }),
  DeliveryTimeout: (orderId, seller) => ({
    orderId,
    seller,
  }),
  AuctionExtended: (orderId, newEndTime) => ({
    orderId,
    newEndTime: newEndTime.toString(),
  }),
  Withdrawn: (bidder, amount) => ({
    bidder,
    amount: amount.toString(),
  }),
};

@Injectable()
export class BlockchainEventListenerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BlockchainEventListenerService.name);

  constructor(
    @Inject(ESCROW_CONTRACT)
    private readonly contract: Contract,
    private readonly outboxService: OutboxService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting blockchain event listeners...');

    for (const [eventName, routingKey] of Object.entries(EVENT_ROUTING_KEYS)) {
      const extractor = EVENT_EXTRACTORS[eventName];
      if (!extractor) continue;

      await this.contract.on(eventName, async (...args) => {
        try {
          const payload = extractor(...args);
          const aggregateId = payload.orderId ?? payload.bidder ?? 'unknown';

          this.logger.log(
            `Received on-chain event: ${eventName} (${aggregateId})`,
          );

          await this.outboxService.createOutboxMessage({
            aggregateType: 'blockchain',
            aggregateId,
            eventType: eventName,
            payload,
            exchange: ExchangeName.BLOCKCHAIN_EVENTS,
            routingKey,
          });
        } catch (error) {
          this.logger.error(
            `Failed to process on-chain event ${eventName}: ${error.message}`,
            error.stack,
          );
        }
      });

      this.logger.debug(`Registered listener for: ${eventName}`);
    }

    this.logger.log('All blockchain event listeners registered');
  }

  async onModuleDestroy() {
    this.logger.log('Removing blockchain event listeners...');
    await this.contract.removeAllListeners();
  }
}
