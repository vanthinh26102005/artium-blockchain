import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import {
  EscrowState,
  PayoutStatus,
  RpcExceptionHelper,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
  SellerAuctionStartStatus,
} from '@app/common';
import {
  IAuctionStartAttemptRepository,
  IOrderItemRepository,
  IOrderRepository,
} from '../../domain/interfaces';
import { AuctionStartAttempt, Order } from '../../domain/entities';
import { SellerAuctionLifecycleOutboxService } from '../services';

const ARTWORK_SERVICE_CLIENT = 'ARTWORK_SERVICE';
const ARTWORK_RPC_TIMEOUT_MS = 30_000;

@Injectable()
export class BlockchainEventHandler {
  private readonly logger = new Logger(BlockchainEventHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    @Inject(IOrderItemRepository)
    private readonly orderItemRepo: IOrderItemRepository,
    @Inject(IAuctionStartAttemptRepository)
    private readonly startAttemptRepo: IAuctionStartAttemptRepository,
    @Inject(ARTWORK_SERVICE_CLIENT)
    private readonly artworkClient: ClientProxy,
    private readonly lifecycleOutbox: SellerAuctionLifecycleOutboxService,
  ) {}

  private generateOrderNumber(prefix = 'AUC') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  private getBlockchainEventMetadata(message: Record<string, unknown>) {
    const txHash = typeof message.txHash === 'string' ? message.txHash : null;
    const contractAddress =
      typeof message.contractAddress === 'string'
        ? message.contractAddress
        : null;
    const chainId =
      typeof message.chainId === 'string' ? message.chainId : null;

    return {
      ...(txHash ? { txHash } : {}),
      ...(contractAddress ? { contractAddress } : {}),
      ...(chainId ? { chainId } : {}),
    };
  }

  private getBidAmountTotals(amountWei?: string) {
    if (!amountWei || !/^\d+$/.test(amountWei)) {
      return {};
    }

    const amountEth = Number(amountWei) / 1_000_000_000_000_000_000;
    if (!Number.isFinite(amountEth)) {
      return {};
    }

    const roundedAmount = Number(amountEth.toFixed(2));
    return {
      subtotal: roundedAmount,
      totalAmount: roundedAmount,
    };
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
      const existing = await this.orderRepo.findByOnChainOrderId(
        message.orderId,
      );
      const estimatedDeliveryDate = this.parseUnixSecondsToDate(
        message.endTime,
      );
      const startAttempt = await this.startAttemptRepo.findByOrderId(
        message.orderId,
      );

      if (startAttempt) {
        await this.promoteStartAttempt(
          startAttempt,
          message,
          estimatedDeliveryDate,
          existing,
        );
        return;
      }

      if (existing) {
        await this.orderRepo.update(existing.id, {
          status: OrderStatus.AUCTION_ACTIVE,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          paymentStatus: OrderPaymentStatus.UNPAID,
          sellerWallet: message.seller,
          escrowState: EscrowState.STARTED,
          estimatedDeliveryDate,
          ...this.getBlockchainEventMetadata(message),
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
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle AuctionStarted: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async promoteStartAttempt(
    attempt: AuctionStartAttempt,
    message: { orderId: string; seller: string; endTime: string },
    estimatedDeliveryDate: Date | null,
    existingOrder: Order | null,
  ) {
    const order = existingOrder
      ? await this.orderRepo.update(existingOrder.id, {
          status: OrderStatus.AUCTION_ACTIVE,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          paymentStatus: OrderPaymentStatus.UNPAID,
          onChainOrderId: message.orderId,
          contractAddress:
            attempt.contractAddress ?? existingOrder.contractAddress ?? null,
          sellerWallet: message.seller,
          txHash: attempt.txHash ?? existingOrder.txHash ?? null,
          escrowState: EscrowState.STARTED,
          estimatedDeliveryDate,
        })
      : await this.orderRepo.create({
          collectorId: null,
          orderNumber: attempt.orderId,
          status: OrderStatus.AUCTION_ACTIVE,
          subtotal: 0,
          totalAmount: 0,
          shippingCost: 0,
          taxAmount: 0,
          currency: 'ETH',
          paymentStatus: OrderPaymentStatus.UNPAID,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          onChainOrderId: message.orderId,
          contractAddress: attempt.contractAddress ?? null,
          txHash: attempt.txHash ?? null,
          sellerWallet: message.seller,
          escrowState: EscrowState.STARTED,
          estimatedDeliveryDate,
        });

    if (!order) {
      throw RpcExceptionHelper.internalError(
        'Failed to promote seller auction start into an order projection',
      );
    }

    await this.ensureAuctionOrderItem(order.id, attempt);
    const updatedAttempt = await this.startAttemptRepo.update(attempt.id, {
      status: SellerAuctionStartStatus.AUCTION_ACTIVE,
      walletAddress: message.seller,
      retryAllowed: false,
      editAllowed: false,
      walletActionRequired: false,
      reasonCode: null,
      reasonMessage: null,
      activatedAt: attempt.activatedAt ?? new Date(),
    });
    if (updatedAttempt) {
      await this.lifecycleOutbox.queueAttemptSnapshot(updatedAttempt);
    }
    await this.markArtworkInAuction(attempt);
  }

  private async ensureAuctionOrderItem(
    orderId: string,
    attempt: AuctionStartAttempt,
  ) {
    const existingItems = await this.orderItemRepo.findByOrderId(orderId);
    const matchedItem =
      existingItems.find((item) => item.artworkId === attempt.artworkId) ??
      existingItems[0] ??
      null;

    if (!matchedItem) {
      await this.orderItemRepo.create({
        orderId,
        artworkId: attempt.artworkId,
        sellerId: attempt.sellerId,
        priceAtPurchase: 0,
        quantity: 1,
        currency: 'ETH',
        artworkTitle: attempt.artworkTitle,
        artworkImageUrl: attempt.thumbnailUrl ?? null,
        artworkDescription: null,
        platformFee: null,
        sellerPayoutAmount: null,
        payoutStatus: PayoutStatus.PENDING,
        payoutAt: null,
      });
      return;
    }

    const nextItemPatch: Record<string, unknown> = {};
    if (matchedItem.artworkId !== attempt.artworkId) {
      nextItemPatch.artworkId = attempt.artworkId;
    }
    if (matchedItem.sellerId !== attempt.sellerId) {
      nextItemPatch.sellerId = attempt.sellerId;
    }
    if (matchedItem.artworkTitle !== attempt.artworkTitle) {
      nextItemPatch.artworkTitle = attempt.artworkTitle;
    }
    if (
      (matchedItem.artworkImageUrl ?? null) !== (attempt.thumbnailUrl ?? null)
    ) {
      nextItemPatch.artworkImageUrl = attempt.thumbnailUrl ?? null;
    }
    if (matchedItem.currency !== 'ETH') {
      nextItemPatch.currency = 'ETH';
    }
    if (matchedItem.quantity !== 1) {
      nextItemPatch.quantity = 1;
    }
    if (Number(matchedItem.priceAtPurchase) !== 0) {
      nextItemPatch.priceAtPurchase = 0;
    }

    if (Object.keys(nextItemPatch).length > 0) {
      await this.orderItemRepo.update(matchedItem.id, nextItemPatch);
    }
  }

  private async markArtworkInAuction(attempt: AuctionStartAttempt) {
    await firstValueFrom(
      this.artworkClient
        .send(
          { cmd: 'mark_artwork_in_auction' },
          {
            artworkId: attempt.artworkId,
            sellerId: attempt.sellerId,
            onChainAuctionId: attempt.orderId,
          },
        )
        .pipe(timeout(ARTWORK_RPC_TIMEOUT_MS)),
    );
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
          ...this.getBidAmountTotals(message.amount),
          ...this.getBlockchainEventMetadata(message),
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
        ...this.getBidAmountTotals(message.amount),
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle NewBid: ${error.message}`,
        error.stack,
      );
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
    this.logger.log(
      `Auction ended: ${message.orderId}, winner: ${message.winner}`,
    );
    try {
      const existing = await this.orderRepo.findByOnChainOrderId(
        message.orderId,
      );
      if (existing) {
        await this.orderRepo.update(existing.id, {
          status: OrderStatus.ESCROW_HELD,
          paymentStatus: OrderPaymentStatus.ESCROW,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          buyerWallet: message.winner,
          bidAmountWei: message.amount,
          escrowState: EscrowState.ENDED,
          ...this.getBidAmountTotals(message.amount),
          ...this.getBlockchainEventMetadata(message),
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
        ...this.getBidAmountTotals(message.amount),
        ...this.getBlockchainEventMetadata(message),
      });

      this.logger.log(`Order created for auction: ${message.orderId}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle AuctionEnded: ${error.message}`,
        error.stack,
      );
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
    this.logger.log(
      `Auction extended: ${message.orderId} -> ${message.newEndTime}`,
    );

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
          estimatedDeliveryDate: this.parseUnixSecondsToDate(
            message.newEndTime,
          ),
          ...this.getBlockchainEventMetadata(message),
        });
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.AUCTION_ACTIVE,
        estimatedDeliveryDate: this.parseUnixSecondsToDate(message.newEndTime),
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle AuctionExtended: ${error.message}`,
        error.stack,
      );
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
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle ArtShipped: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_CONFIRMED,
    queue: 'orders-service.blockchain.delivery-confirmed',
    queueOptions: { durable: true },
  })
  async handleDeliveryConfirmed(message: { orderId: string; winner: string }) {
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
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle DeliveryConfirmed: ${error.message}`,
        error.stack,
      );
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
        disputeReason: message.reason,
        disputeOpenedAt: new Date(),
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle DisputeOpened: ${error.message}`,
        error.stack,
      );
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
    this.logger.log(
      `Dispute resolved for auction: ${message.orderId}, favorBuyer: ${message.favorBuyer}`,
    );
    try {
      const order = await this.orderRepo.findByOnChainOrderId(message.orderId);
      if (!order) {
        this.logger.warn(`No order found for on-chain ID: ${message.orderId}`);
        return;
      }

      const status = message.favorBuyer
        ? OrderStatus.REFUNDED
        : OrderStatus.DELIVERED;
      const escrowState = message.favorBuyer
        ? EscrowState.CANCELLED
        : EscrowState.COMPLETED;
      const paymentStatus = message.favorBuyer
        ? OrderPaymentStatus.REFUNDED
        : OrderPaymentStatus.RELEASED;

      await this.orderRepo.update(order.id, {
        status,
        escrowState,
        paymentStatus,
        disputeResolvedAt: new Date(),
        disputeResolutionNotes: message.favorBuyer
          ? 'Resolved in favor of buyer'
          : 'Resolved in favor of seller',
        ...(status === OrderStatus.DELIVERED
          ? { deliveredAt: new Date() }
          : {}),
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle DisputeResolved: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_CANCELLED,
    queue: 'orders-service.blockchain.auction-cancelled',
    queueOptions: { durable: true },
  })
  async handleAuctionCancelled(message: { orderId: string; reason: string }) {
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
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle AuctionCancelled: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_SHIPPING_TIMEOUT,
    queue: 'orders-service.blockchain.shipping-timeout',
    queueOptions: { durable: true },
  })
  async handleShippingTimeout(message: { orderId: string; buyer: string }) {
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
          ...this.getBlockchainEventMetadata(message),
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
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle ShippingTimeout: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.BLOCKCHAIN_EVENTS,
    routingKey: RoutingKey.BLOCKCHAIN_AUCTION_DELIVERY_TIMEOUT,
    queue: 'orders-service.blockchain.delivery-timeout',
    queueOptions: { durable: true },
  })
  async handleDeliveryTimeout(message: { orderId: string; seller: string }) {
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
          ...this.getBlockchainEventMetadata(message),
        });
        return;
      }

      await this.orderRepo.update(order.id, {
        status: OrderStatus.DELIVERED,
        paymentStatus: OrderPaymentStatus.RELEASED,
        sellerWallet: message.seller,
        escrowState: EscrowState.COMPLETED,
        deliveredAt: new Date(),
        ...this.getBlockchainEventMetadata(message),
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle DeliveryTimeout: ${error.message}`,
        error.stack,
      );
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
    bidder: string;
    amount: string;
    txHash: string;
    blockNumber: string;
  }) {
    this.logger.log(
      `Funds withdrawn: bidder=${message.bidder} amount=${message.amount} wei tx=${message.txHash}`,
    );

    try {
      // Notification-only per spec — no order state change.
      // The Withdrawn event is wallet-level (no orderId) and covers
      // aggregated pendingReturns from outbids, cancellations, and refunds.
      this.logger.debug(
        `Withdrawal confirmed on-chain at block ${message.blockNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle FundsWithdrawn: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
