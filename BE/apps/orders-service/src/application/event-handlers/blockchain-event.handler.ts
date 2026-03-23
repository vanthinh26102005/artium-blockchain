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
        this.logger.warn(`Order already exists for on-chain ID: ${message.orderId}`);
        return;
      }

      const orderNumber = `AUC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await this.orderRepo.create({
        collectorId: null,
        orderNumber,
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

      await this.orderRepo.update(order.id, {
        status,
        escrowState,
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
      });
    } catch (error) {
      this.logger.error(`Failed to handle AuctionCancelled: ${error.message}`, error.stack);
      throw error;
    }
  }
}
