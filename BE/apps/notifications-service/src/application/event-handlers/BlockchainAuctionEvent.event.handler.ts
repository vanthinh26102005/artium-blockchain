import { Inject, Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  DeadLetterExchangeName,
  DeadLetterRoutingKey,
  ExchangeName,
  RoutingKey,
} from '@app/rabbitmq';
import { ITransactionService } from '@app/common';
import {
  INotificationHistoryRepository,
  NotificationChannel,
  NotificationStatus,
  NotificationTriggerEvent,
} from '../../domain';
import { OutboxService } from '@app/outbox';
import { EntityManager } from 'typeorm';

const DLX_QUEUE_OPTIONS = {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': DeadLetterExchangeName.BLOCKCHAIN_EVENTS_DLX,
    'x-dead-letter-routing-key':
      DeadLetterRoutingKey.BLOCKCHAIN_AUCTION_NOTIFICATION_FAILED,
  },
};

const errorHandler = (channel: any, msg: any) => {
  channel.nack(msg, false, false);
};

@Injectable()
export class BlockchainAuctionEventHandler {
  private readonly logger = new Logger(BlockchainAuctionEventHandler.name);

  constructor(
    @Inject(INotificationHistoryRepository)
    private readonly notificationHistoryRepo: INotificationHistoryRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
    private readonly outboxService: OutboxService,
  ) {}

  private async createNotificationWithOutbox(
    triggerEvent: NotificationTriggerEvent,
    title: string,
    body: string,
    metadata: Record<string, any>,
    emailTemplate: string,
    manager: EntityManager,
  ) {
    const history = await this.notificationHistoryRepo.create(
      {
        channel: NotificationChannel.IN_APP,
        triggerEvent,
        title,
        body,
        status: NotificationStatus.PENDING,
        metadata,
      },
      manager,
    );

    await this.outboxService.createOutboxMessage(
      {
        aggregateType: 'notification',
        aggregateId: history.id,
        eventType: `SEND_${triggerEvent}_EMAIL`,
        payload: {
          historyId: history.id,
          subject: title,
          title,
          template: emailTemplate,
          context: { ...metadata, body },
          triggerEvent,
          metadata,
        },
        exchange: ExchangeName.NOTIFICATION_EVENTS,
        routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
      },
      manager,
    );

    return history;
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_STARTED,
    queue: 'notification.blockchain.auction-started',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleAuctionStarted(event: {
    orderId: string;
    seller: string;
    endTime: string;
  }) {
    this.logger.log(`Auction started notification: orderId=${event.orderId}`);
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_STARTED,
          'New Auction Started',
          `A new auction has started and ends at ${new Date(Number(event.endTime) * 1000).toISOString()}.`,
          { onChainOrderId: event.orderId, seller: event.seller },
          'auction-started',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle AuctionStarted notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_BID_NEW,
    queue: 'notification.blockchain.bid-new',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleNewBid(event: {
    orderId: string;
    bidder: string;
    amount: string;
  }) {
    this.logger.log(`New bid notification: orderId=${event.orderId}, bidder=${event.bidder}`);
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_BID_PLACED,
          'New Bid Placed',
          `A new bid of ${event.amount} wei was placed on auction ${event.orderId}.`,
          { onChainOrderId: event.orderId, bidder: event.bidder, amount: event.amount },
          'auction-bid-placed',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle NewBid notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_ENDED,
    queue: 'notification.blockchain.auction-ended',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleAuctionEnded(event: {
    orderId: string;
    winner: string;
    amount: string;
  }) {
    this.logger.log(`Auction ended notification: orderId=${event.orderId}`);
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_ENDED,
          'Auction Ended',
          `Auction ${event.orderId} has ended. Winner: ${event.winner} with bid of ${event.amount} wei.`,
          { onChainOrderId: event.orderId, winner: event.winner, amount: event.amount },
          'auction-ended',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle AuctionEnded notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPED,
    queue: 'notification.blockchain.auction-shipped',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleArtShipped(event: {
    orderId: string;
    seller: string;
    trackingHash: string;
  }) {
    this.logger.log(`Art shipped notification: orderId=${event.orderId}`);
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_SHIPPED,
          'Artwork Shipped',
          `The artwork from auction ${event.orderId} has been shipped. Tracking: ${event.trackingHash}`,
          { onChainOrderId: event.orderId, seller: event.seller, trackingHash: event.trackingHash },
          'auction-shipped',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle ArtShipped notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_CONFIRMED,
    queue: 'notification.blockchain.delivery-confirmed',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleDeliveryConfirmed(event: {
    orderId: string;
    winner: string;
  }) {
    this.logger.log(`Delivery confirmed notification: orderId=${event.orderId}`);
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_DELIVERY_CONFIRMED,
          'Delivery Confirmed',
          `Delivery for auction ${event.orderId} has been confirmed. Payment released to seller.`,
          { onChainOrderId: event.orderId, winner: event.winner },
          'auction-delivery-confirmed',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle DeliveryConfirmed notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_DISPUTE_OPENED,
    queue: 'notification.blockchain.dispute-opened',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleDisputeOpened(event: {
    orderId: string;
    buyer: string;
    reason: string;
  }) {
    this.logger.log(`Dispute opened notification: orderId=${event.orderId}`);
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_DISPUTE_OPENED,
          'Dispute Opened',
          `A dispute has been opened for auction ${event.orderId}. Reason: ${event.reason}`,
          { onChainOrderId: event.orderId, buyer: event.buyer, reason: event.reason },
          'auction-dispute-opened',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle DisputeOpened notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_DISPUTE_RESOLVED,
    queue: 'notification.blockchain.dispute-resolved',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleDisputeResolved(event: {
    orderId: string;
    arbiter: string;
    favorBuyer: boolean;
  }) {
    this.logger.log(`Dispute resolved notification: orderId=${event.orderId}`);
    try {
      const outcome = event.favorBuyer ? 'Buyer refunded' : 'Seller paid';
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_DISPUTE_RESOLVED,
          'Dispute Resolved',
          `Dispute for auction ${event.orderId} has been resolved. Outcome: ${outcome}.`,
          { onChainOrderId: event.orderId, arbiter: event.arbiter, favorBuyer: event.favorBuyer },
          'auction-dispute-resolved',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle DisputeResolved notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_CANCELLED,
    queue: 'notification.blockchain.auction-cancelled',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleAuctionCancelled(event: {
    orderId: string;
    reason: string;
  }) {
    this.logger.log(`Auction cancelled notification: orderId=${event.orderId}`);
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_CANCELLED,
          'Auction Cancelled',
          `Auction ${event.orderId} has been cancelled. Reason: ${event.reason}`,
          { onChainOrderId: event.orderId, reason: event.reason },
          'auction-cancelled',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle AuctionCancelled notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPING_TIMEOUT,
    queue: 'notification.blockchain.shipping-timeout',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleShippingTimeout(event: {
    orderId: string;
    buyer: string;
  }) {
    this.logger.log(`Shipping timeout notification: orderId=${event.orderId}`);
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_SHIPPING_TIMEOUT,
          'Shipping Deadline Expired',
          `Seller failed to ship auction ${event.orderId} within the deadline. You may claim a refund.`,
          { onChainOrderId: event.orderId, buyer: event.buyer },
          'auction-shipping-timeout',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle ShippingTimeout notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_TIMEOUT,
    queue: 'notification.blockchain.delivery-timeout',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleDeliveryTimeout(event: {
    orderId: string;
    seller: string;
  }) {
    this.logger.log(`Delivery timeout notification: orderId=${event.orderId}`);
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_DELIVERY_TIMEOUT,
          'Delivery Deadline Expired',
          `Buyer did not confirm delivery for auction ${event.orderId}. Seller may claim payment.`,
          { onChainOrderId: event.orderId, seller: event.seller },
          'auction-delivery-timeout',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(`Failed to handle DeliveryTimeout notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_FUNDS_WITHDRAWN,
    queue: 'notification.blockchain.funds-withdrawn',
    queueOptions: DLX_QUEUE_OPTIONS,
    errorHandler,
  })
  async handleFundsWithdrawn(event: {
    bidder: string;
    amount: string;
    txHash: string;
    blockNumber: string;
  }) {
    this.logger.log(
      `Funds withdrawn notification: bidder=${event.bidder} amount=${event.amount} wei`,
    );
    try {
      await this.transactionService.execute(async (manager) => {
        await this.createNotificationWithOutbox(
          NotificationTriggerEvent.AUCTION_FUNDS_WITHDRAWN,
          'Funds Withdrawn Successfully',
          `You have successfully withdrawn ${event.amount} wei from the escrow contract.`,
          {
            bidder: event.bidder,
            amount: event.amount,
            txHash: event.txHash,
            blockNumber: event.blockNumber,
          },
          'auction-funds-withdrawn',
          manager,
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle FundsWithdrawn notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
