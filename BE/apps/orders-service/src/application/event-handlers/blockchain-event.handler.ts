import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import {
  EscrowState,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
} from '@app/common';
import { IOrderRepository } from '../../domain/interfaces';

@Injectable()
export class BlockchainEventHandler {
  private readonly logger = new Logger(BlockchainEventHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  private generateOrderNumber(prefix = 'AUC') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  private parseUnixSecondsToDate(value?: string): Date | null {
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return null;
    }
    return new Date(seconds * 1000);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_STARTED,
    queue: 'orders-service.blockchain.auction-started',
    queueOptions: { durable: true },
  })
  async handleAuctionStarted(message: {
    orderId: string;
    seller: string;
    endTime: string;
  }) {
    this.logger.log(`Auction started: ${message.orderId}`);

    try {
      const existing = await this.orderRepo.findByOnChainOrderId(message.orderId);
      const estimatedDeliveryDate = this.parseUnixSecondsToDate(message.endTime);

      if (existing) {
        await this.orderRepo.update(existing.id, {
          status: OrderStatus.AUCTION_ACTIVE,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          paymentStatus: OrderPaymentStatus.UNPAID,
          sellerWallet: message.seller,
          escrowState: EscrowState.STARTED,
          estimatedDeliveryDate,
        });
        return;
      }

      await this.orderRepo.create({
        collectorId: null,
        orderNumber: this.generateOrderNumber('AUC'),
        status: OrderStatus.AUCTION_ACTIVE,
        subtotal: 0,
        totalAmount: 0,
        shippingCost: 0,
        taxAmount: 0,
        currency: 'ETH',
        paymentStatus: OrderPaymentStatus.UNPAID,
        paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
        onChainOrderId: message.orderId,
        sellerWallet: message.seller,
        escrowState: EscrowState.STARTED,
        estimatedDeliveryDate,
      });
    } catch (error) {
      this.logger.error(`Failed to handle AuctionStarted: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_BID_NEW,
    queue: 'orders-service.blockchain.bid-new',
    queueOptions: { durable: true },
  })
  async handleNewBid(message: {
    orderId: string;
    bidder: string;
    amount: string;
  }) {
    this.logger.log(`New bid: ${message.orderId} by ${message.bidder}`);

    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        await this.orderRepo.create({
          collectorId: null,
          orderNumber: this.generateOrderNumber('AUC'),
          status: OrderStatus.AUCTION_ACTIVE,
          subtotal: 0,
          totalAmount: 0,
          shippingCost: 0,
          taxAmount: 0,
          currency: 'ETH',
          paymentStatus: OrderPaymentStatus.UNPAID,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          onChainOrderId: message.orderId,
          buyerWallet: message.bidder,
          bidAmountWei: message.amount,
          escrowState: EscrowState.STARTED,
        });
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.AUCTION_ACTIVE,
        buyerWallet: message.bidder,
        bidAmountWei: message.amount,
        paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
        paymentStatus: OrderPaymentStatus.UNPAID,
        escrowState: order.escrowState ?? EscrowState.STARTED,
      });
    } catch (error) {
      this.logger.error(`Failed to handle NewBid: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_ENDED,
    queue: 'orders-service.blockchain.auction-ended',
    queueOptions: { durable: true },
  })
  async handleAuctionEnded(message: {
    orderId: string;
    winner: string;
    amount: string;
  }) {
    this.logger.log(`Auction ended: ${message.orderId}, winner: ${message.winner}`);
    try {
      const existing = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (existing) {
        await this.orderRepo.update(existing.id, {
          status: OrderStatus.ESCROW_HELD,
          paymentStatus: OrderPaymentStatus.ESCROW,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          buyerWallet: message.winner,
          bidAmountWei: message.amount,
          escrowState: EscrowState.ENDED,
        });
        return;
      }

      await this.orderRepo.create({
        collectorId: null,
        orderNumber: this.generateOrderNumber('AUC'),
        status: OrderStatus.ESCROW_HELD,
        subtotal: 0,
        totalAmount: 0,
        shippingCost: 0,
        taxAmount: 0,
        currency: 'ETH',
        paymentStatus: OrderPaymentStatus.ESCROW,
        paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
        onChainOrderId: message.orderId,
        buyerWallet: message.winner,
        bidAmountWei: message.amount,
        escrowState: EscrowState.ENDED,
      });

      this.logger.log(`Order created for auction: ${message.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to handle AuctionEnded: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_EXTENDED,
    queue: 'orders-service.blockchain.auction-extended',
    queueOptions: { durable: true },
  })
  async handleAuctionExtended(message: {
    orderId: string;
    newEndTime: string;
  }) {
    this.logger.log(`Auction extended: ${message.orderId} -> ${message.newEndTime}`);

    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        await this.orderRepo.create({
          collectorId: null,
          orderNumber: this.generateOrderNumber('AUC'),
          status: OrderStatus.AUCTION_ACTIVE,
          subtotal: 0,
          totalAmount: 0,
          shippingCost: 0,
          taxAmount: 0,
          currency: 'ETH',
          paymentStatus: OrderPaymentStatus.UNPAID,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          onChainOrderId: message.orderId,
          escrowState: EscrowState.STARTED,
          estimatedDeliveryDate: this.parseUnixSecondsToDate(message.newEndTime),
        });
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.AUCTION_ACTIVE,
        estimatedDeliveryDate: this.parseUnixSecondsToDate(message.newEndTime),
      });
    } catch (error) {
      this.logger.error(`Failed to handle AuctionExtended: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPED,
    queue: 'orders-service.blockchain.auction-shipped',
    queueOptions: { durable: true },
  })
  async handleArtShipped(message: {
    orderId: string;
    seller: string;
    trackingHash: string;
  }) {
    this.logger.log(`Art shipped for auction: ${message.orderId}`);
    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        this.logger.warn(`No order found for on-chain ID: ${message.orderId}`);
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.SHIPPED,
        shippedAt: new Date(),
        sellerWallet: message.seller,
        trackingNumber: message.trackingHash,
        escrowState: EscrowState.SHIPPED,
        paymentStatus: OrderPaymentStatus.ESCROW,
      });
    } catch (error) {
      this.logger.error(`Failed to handle ArtShipped: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_CONFIRMED,
    queue: 'orders-service.blockchain.delivery-confirmed',
    queueOptions: { durable: true },
  })
  async handleDeliveryConfirmed(message: {
    orderId: string;
    winner: string;
  }) {
    this.logger.log(`Delivery confirmed for auction: ${message.orderId}`);
    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        this.logger.warn(`No order found for on-chain ID: ${message.orderId}`);
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
        escrowState: EscrowState.COMPLETED,
        paymentStatus: OrderPaymentStatus.RELEASED,
      });
    } catch (error) {
      this.logger.error(`Failed to handle DeliveryConfirmed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_DISPUTE_OPENED,
    queue: 'orders-service.blockchain.dispute-opened',
    queueOptions: { durable: true },
  })
  async handleDisputeOpened(message: {
    orderId: string;
    buyer: string;
    reason: string;
  }) {
    this.logger.log(`Dispute opened for auction: ${message.orderId}`);
    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        this.logger.warn(`No order found for on-chain ID: ${message.orderId}`);
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.DISPUTE_OPEN,
        escrowState: EscrowState.DISPUTED,
        internalNotes: `Dispute reason: ${message.reason}`,
      });
    } catch (error) {
      this.logger.error(`Failed to handle DisputeOpened: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_DISPUTE_RESOLVED,
    queue: 'orders-service.blockchain.dispute-resolved',
    queueOptions: { durable: true },
  })
  async handleDisputeResolved(message: {
    orderId: string;
    arbiter: string;
    favorBuyer: boolean;
  }) {
    this.logger.log(`Dispute resolved for auction: ${message.orderId}, favorBuyer: ${message.favorBuyer}`);
    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        this.logger.warn(`No order found for on-chain ID: ${message.orderId}`);
        return;
      }

      const status = message.favorBuyer ? OrderStatus.REFUNDED : OrderStatus.DELIVERED;
      const escrowState = message.favorBuyer ? EscrowState.CANCELLED : EscrowState.COMPLETED;
      const paymentStatus = message.favorBuyer
        ? OrderPaymentStatus.REFUNDED
        : OrderPaymentStatus.RELEASED;

      await this.orderRepo.update(order.id, {
        status,
        escrowState,
        paymentStatus,
        ...(status === OrderStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
      });
    } catch (error) {
      this.logger.error(`Failed to handle DisputeResolved: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_CANCELLED,
    queue: 'orders-service.blockchain.auction-cancelled',
    queueOptions: { durable: true },
  })
  async handleAuctionCancelled(message: {
    orderId: string;
    reason: string;
  }) {
    this.logger.log(`Auction cancelled: ${message.orderId}`);
    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        this.logger.warn(`No order found for on-chain ID: ${message.orderId}`);
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledReason: message.reason,
        escrowState: EscrowState.CANCELLED,
        paymentStatus: OrderPaymentStatus.REFUNDED,
      });
    } catch (error) {
      this.logger.error(`Failed to handle AuctionCancelled: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPING_TIMEOUT,
    queue: 'orders-service.blockchain.shipping-timeout',
    queueOptions: { durable: true },
  })
  async handleShippingTimeout(message: {
    orderId: string;
    buyer: string;
  }) {
    this.logger.log(`Shipping timeout: ${message.orderId}`);
    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        await this.orderRepo.create({
          collectorId: null,
          orderNumber: this.generateOrderNumber('AUC'),
          status: OrderStatus.REFUNDED,
          subtotal: 0,
          totalAmount: 0,
          shippingCost: 0,
          taxAmount: 0,
          currency: 'ETH',
          paymentStatus: OrderPaymentStatus.REFUNDED,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          onChainOrderId: message.orderId,
          buyerWallet: message.buyer,
          escrowState: EscrowState.CANCELLED,
          cancelledAt: new Date(),
          cancelledReason: 'Shipping timeout',
        });
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.REFUNDED,
        paymentStatus: OrderPaymentStatus.REFUNDED,
        buyerWallet: message.buyer,
        escrowState: EscrowState.CANCELLED,
        cancelledAt: new Date(),
        cancelledReason: 'Shipping timeout',
      });
    } catch (error) {
      this.logger.error(`Failed to handle ShippingTimeout: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_TIMEOUT,
    queue: 'orders-service.blockchain.delivery-timeout',
    queueOptions: { durable: true },
  })
  async handleDeliveryTimeout(message: {
    orderId: string;
    seller: string;
  }) {
    this.logger.log(`Delivery timeout: ${message.orderId}`);
    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        await this.orderRepo.create({
          collectorId: null,
          orderNumber: this.generateOrderNumber('AUC'),
          status: OrderStatus.DELIVERED,
          subtotal: 0,
          totalAmount: 0,
          shippingCost: 0,
          taxAmount: 0,
          currency: 'ETH',
          paymentStatus: OrderPaymentStatus.RELEASED,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          onChainOrderId: message.orderId,
          sellerWallet: message.seller,
          escrowState: EscrowState.COMPLETED,
          deliveredAt: new Date(),
        });
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.DELIVERED,
        paymentStatus: OrderPaymentStatus.RELEASED,
        sellerWallet: message.seller,
        escrowState: EscrowState.COMPLETED,
        deliveredAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to handle DeliveryTimeout: ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_FUNDS_WITHDRAWN,
    queue: 'orders-service.blockchain.funds-withdrawn',
    queueOptions: { durable: true },
  })
  async handleFundsWithdrawn(message: {
    user: string;
    amount: string;
  }) {
    this.logger.log(`Funds withdrawn by ${message.user}: ${message.amount} wei`);
  }
}
