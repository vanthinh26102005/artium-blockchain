import { Inject, Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { ITransactionService } from '@app/common';
import {
  INotificationHistoryRepository,
  NotificationChannel,
  NotificationStatus,
  NotificationTriggerEvent,
} from '../../domain';

@Injectable()
export class BlockchainAuctionEventHandler {
  private readonly logger = new Logger(BlockchainAuctionEventHandler.name);

  constructor(
    @Inject(INotificationHistoryRepository)
    private readonly notificationHistoryRepo: INotificationHistoryRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  private async createInAppNotification(
    userId: string | undefined,
    triggerEvent: NotificationTriggerEvent,
    title: string,
    body: string,
    metadata: Record<string, any>,
  ) {
    await this.notificationHistoryRepo.create({
      userId,
      channel: NotificationChannel.IN_APP,
      triggerEvent,
      title,
      body,
      status: NotificationStatus.SENT,
      metadata,
    });
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_STARTED,
    queue: 'notification.blockchain.auction-started',
    queueOptions: { durable: true },
  })
  async handleAuctionStarted(event: {
    orderId: string;
    seller: string;
    endTime: string;
  }) {
    this.logger.log(`Auction started notification: orderId=${event.orderId}`);
    try {
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_STARTED,
        'New Auction Started',
        `A new auction has started and ends at ${new Date(Number(event.endTime) * 1000).toISOString()}.`,
        { onChainOrderId: event.orderId, seller: event.seller },
      );
    } catch (error) {
      this.logger.error(`Failed to handle AuctionStarted notification: ${error.message}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_BID_NEW,
    queue: 'notification.blockchain.bid-new',
    queueOptions: { durable: true },
  })
  async handleNewBid(event: {
    orderId: string;
    bidder: string;
    amount: string;
  }) {
    this.logger.log(`New bid notification: orderId=${event.orderId}, bidder=${event.bidder}`);
    try {
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_BID_PLACED,
        'New Bid Placed',
        `A new bid of ${event.amount} wei was placed on auction ${event.orderId}.`,
        { onChainOrderId: event.orderId, bidder: event.bidder, amount: event.amount },
      );
    } catch (error) {
      this.logger.error(`Failed to handle NewBid notification: ${error.message}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_ENDED,
    queue: 'notification.blockchain.auction-ended',
    queueOptions: { durable: true },
  })
  async handleAuctionEnded(event: {
    orderId: string;
    winner: string;
    amount: string;
  }) {
    this.logger.log(`Auction ended notification: orderId=${event.orderId}`);
    try {
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_ENDED,
        'Auction Ended',
        `Auction ${event.orderId} has ended. Winner: ${event.winner} with bid of ${event.amount} wei.`,
        { onChainOrderId: event.orderId, winner: event.winner, amount: event.amount },
      );
    } catch (error) {
      this.logger.error(`Failed to handle AuctionEnded notification: ${error.message}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPED,
    queue: 'notification.blockchain.auction-shipped',
    queueOptions: { durable: true },
  })
  async handleArtShipped(event: {
    orderId: string;
    seller: string;
    trackingHash: string;
  }) {
    this.logger.log(`Art shipped notification: orderId=${event.orderId}`);
    try {
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_SHIPPED,
        'Artwork Shipped',
        `The artwork from auction ${event.orderId} has been shipped. Tracking: ${event.trackingHash}`,
        { onChainOrderId: event.orderId, seller: event.seller, trackingHash: event.trackingHash },
      );
    } catch (error) {
      this.logger.error(`Failed to handle ArtShipped notification: ${error.message}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_CONFIRMED,
    queue: 'notification.blockchain.delivery-confirmed',
    queueOptions: { durable: true },
  })
  async handleDeliveryConfirmed(event: {
    orderId: string;
    winner: string;
  }) {
    this.logger.log(`Delivery confirmed notification: orderId=${event.orderId}`);
    try {
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_DELIVERY_CONFIRMED,
        'Delivery Confirmed',
        `Delivery for auction ${event.orderId} has been confirmed. Payment released to seller.`,
        { onChainOrderId: event.orderId, winner: event.winner },
      );
    } catch (error) {
      this.logger.error(`Failed to handle DeliveryConfirmed notification: ${error.message}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_DISPUTE_OPENED,
    queue: 'notification.blockchain.dispute-opened',
    queueOptions: { durable: true },
  })
  async handleDisputeOpened(event: {
    orderId: string;
    buyer: string;
    reason: string;
  }) {
    this.logger.log(`Dispute opened notification: orderId=${event.orderId}`);
    try {
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_DISPUTE_OPENED,
        'Dispute Opened',
        `A dispute has been opened for auction ${event.orderId}. Reason: ${event.reason}`,
        { onChainOrderId: event.orderId, buyer: event.buyer, reason: event.reason },
      );
    } catch (error) {
      this.logger.error(`Failed to handle DisputeOpened notification: ${error.message}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_DISPUTE_RESOLVED,
    queue: 'notification.blockchain.dispute-resolved',
    queueOptions: { durable: true },
  })
  async handleDisputeResolved(event: {
    orderId: string;
    arbiter: string;
    favorBuyer: boolean;
  }) {
    this.logger.log(`Dispute resolved notification: orderId=${event.orderId}`);
    try {
      const outcome = event.favorBuyer ? 'Buyer refunded' : 'Seller paid';
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_DISPUTE_RESOLVED,
        'Dispute Resolved',
        `Dispute for auction ${event.orderId} has been resolved. Outcome: ${outcome}.`,
        { onChainOrderId: event.orderId, arbiter: event.arbiter, favorBuyer: event.favorBuyer },
      );
    } catch (error) {
      this.logger.error(`Failed to handle DisputeResolved notification: ${error.message}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_CANCELLED,
    queue: 'notification.blockchain.auction-cancelled',
    queueOptions: { durable: true },
  })
  async handleAuctionCancelled(event: {
    orderId: string;
    reason: string;
  }) {
    this.logger.log(`Auction cancelled notification: orderId=${event.orderId}`);
    try {
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_CANCELLED,
        'Auction Cancelled',
        `Auction ${event.orderId} has been cancelled. Reason: ${event.reason}`,
        { onChainOrderId: event.orderId, reason: event.reason },
      );
    } catch (error) {
      this.logger.error(`Failed to handle AuctionCancelled notification: ${error.message}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPING_TIMEOUT,
    queue: 'notification.blockchain.shipping-timeout',
    queueOptions: { durable: true },
  })
  async handleShippingTimeout(event: {
    orderId: string;
    buyer: string;
  }) {
    this.logger.log(`Shipping timeout notification: orderId=${event.orderId}`);
    try {
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_SHIPPING_TIMEOUT,
        'Shipping Deadline Expired',
        `Seller failed to ship auction ${event.orderId} within the deadline. You may claim a refund.`,
        { onChainOrderId: event.orderId, buyer: event.buyer },
      );
    } catch (error) {
      this.logger.error(`Failed to handle ShippingTimeout notification: ${error.message}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_TIMEOUT,
    queue: 'notification.blockchain.delivery-timeout',
    queueOptions: { durable: true },
  })
  async handleDeliveryTimeout(event: {
    orderId: string;
    seller: string;
  }) {
    this.logger.log(`Delivery timeout notification: orderId=${event.orderId}`);
    try {
      await this.createInAppNotification(
        undefined,
        NotificationTriggerEvent.AUCTION_DELIVERY_TIMEOUT,
        'Delivery Deadline Expired',
        `Buyer did not confirm delivery for auction ${event.orderId}. Seller may claim payment.`,
        { onChainOrderId: event.orderId, seller: event.seller },
      );
    } catch (error) {
      this.logger.error(`Failed to handle DeliveryTimeout notification: ${error.message}`, error.stack);
    }
  }
}
