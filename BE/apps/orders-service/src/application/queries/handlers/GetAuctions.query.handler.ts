import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  AuctionCategoryKey,
  AuctionReadObject,
  AuctionStatusKey,
  EscrowState,
  GetAuctionsDto,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
  RpcExceptionHelper,
} from '@app/common';
import { EscrowContractService, AuctionCoreDto } from '@app/blockchain';
import { ethers } from 'ethers';
import { GetAuctionsQuery } from '../GetAuctions.query';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';

type AuctionFilters = GetAuctionsDto & {
  sellerId?: string;
  includeSettled?: boolean;
};

const MAX_AUCTION_TAKE = 50;
const DEFAULT_AUCTION_TAKE = 20;
const DEFAULT_MIN_INCREMENT_WEI = '100000000000000000';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ONE_HOUR_MS = 60 * 60 * 1000;
const CATEGORY_CYCLE = [
  AuctionCategoryKey.ARCHITECTURAL,
  AuctionCategoryKey.SCULPTURE,
  AuctionCategoryKey.DIGITAL,
  AuctionCategoryKey.INSTALLATION,
] as const;

@QueryHandler(GetAuctionsQuery)
export class GetAuctionsHandler implements IQueryHandler<GetAuctionsQuery> {
  private readonly logger = new Logger(GetAuctionsHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    private readonly escrowContractService: EscrowContractService,
  ) {}

  async execute(
    query: GetAuctionsQuery,
  ): Promise<{ data: AuctionReadObject[]; total: number }> {
    try {
      const filters = query.filters as AuctionFilters;
      this.logger.log(
        `Getting auctions with filters: ${JSON.stringify(filters)}`,
      );

      const take = Math.min(
        filters.take ?? DEFAULT_AUCTION_TAKE,
        MAX_AUCTION_TAKE,
      );
      const skip = filters.skip ?? 0;
      const blockchainWhere = {
        paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
        status: filters.includeSettled
          ? {
              $in: [
                OrderStatus.AUCTION_ACTIVE,
                OrderStatus.ESCROW_HELD,
                OrderStatus.SHIPPED,
                OrderStatus.DELIVERED,
                OrderStatus.CANCELLED,
                OrderStatus.REFUNDED,
                OrderStatus.DISPUTE_OPEN,
              ],
            }
          : OrderStatus.AUCTION_ACTIVE,
        onChainOrderId: { $ne: null },
      };

      const [orders, total] = await Promise.all([
        this.orderRepo.find({
          where: blockchainWhere,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          relations: ['items'],
        }),
        this.orderRepo.count(blockchainWhere),
      ]);

      const auctions = await Promise.all(
        orders.map(async (order, index) =>
          this.toAuctionReadObject(order, filters, index),
        ),
      );
      const filtered = auctions.filter(
        (auction): auction is AuctionReadObject => {
          if (!auction) {
            return false;
          }
          if (
            filters.sellerId &&
            auction.artwork.sellerId !== filters.sellerId
          ) {
            return false;
          }
          if (
            !filters.status &&
            !filters.includeSettled &&
            auction.statusKey === AuctionStatusKey.CLOSED
          ) {
            return false;
          }
          if (filters.status && auction.statusKey !== filters.status) {
            return false;
          }
          if (
            filters.category &&
            auction.artwork.categoryKey !== filters.category
          ) {
            return false;
          }
          if (
            filters.minBidEth !== undefined &&
            auction.currentBidEth < filters.minBidEth
          ) {
            return false;
          }
          if (
            filters.maxBidEth !== undefined &&
            auction.currentBidEth > filters.maxBidEth
          ) {
            return false;
          }
          return true;
        },
      );

      return { data: filtered, total };
    } catch (error) {
      this.logger.error('Failed to get auctions', error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }

  async toAuctionReadObject(
    order: Order,
    filters: AuctionFilters,
    index: number,
  ): Promise<AuctionReadObject | null> {
    const orderWithItems =
      (await this.orderRepo.findWithItems(order.id)) ?? order;
    const item = orderWithItems.items?.[0];
    const onChainOrderId = orderWithItems.onChainOrderId;

    if (!onChainOrderId || !item?.artworkId || !item.artworkTitle?.trim()) {
      return null;
    }

    const chainAuction = await this.getOnChainAuction(orderWithItems);
    const projectedOrder = await this.reconcileOrderProjection(
      orderWithItems,
      chainAuction,
    );
    const currentBidWei = this.resolveCurrentBidWei(
      projectedOrder,
      chainAuction,
    );
    const minBidIncrementWei =
      chainAuction?.minBidIncrement?.toString() ?? DEFAULT_MIN_INCREMENT_WEI;
    const minimumNextBidWei = (
      BigInt(currentBidWei) + BigInt(minBidIncrementWei)
    ).toString();
    const endsAt = this.resolveEndsAt(projectedOrder, chainAuction);
    const statusKey = this.resolveStatusKey(
      projectedOrder,
      chainAuction,
      endsAt,
    );
    const categoryKey = this.resolveCategory(filters, index);
    const title = item.artworkTitle.trim();
    const imageSrc = item.artworkImageUrl?.trim() ?? '';

    return {
      auctionId: onChainOrderId,
      onChainOrderId,
      contractAddress: projectedOrder.contractAddress ?? null,
      statusKey,
      statusLabel: this.resolveStatusLabel(statusKey),
      currentBidWei,
      currentBidEth: this.weiToEthNumber(currentBidWei),
      minimumNextBidWei,
      minimumNextBidEth: this.weiToEthNumber(minimumNextBidWei),
      minBidIncrementWei,
      endsAt,
      serverTime: new Date().toISOString(),
      highestBidder: this.normalizeAddress(
        chainAuction?.highestBidder ?? projectedOrder.buyerWallet,
      ),
      sellerWallet: this.normalizeAddress(
        chainAuction?.seller ?? projectedOrder.sellerWallet,
      ),
      txHash: projectedOrder.txHash ?? null,
      orderProjectionId: projectedOrder.id,
      orderNumber: projectedOrder.orderNumber,
      orderStatus: projectedOrder.status,
      paymentStatus: projectedOrder.paymentStatus,
      escrowState: projectedOrder.escrowState ?? null,
      artwork: {
        artworkId: item.artworkId,
        sellerId: item.sellerId,
        title,
        creatorName: projectedOrder.sellerWallet ?? 'Artium seller',
        imageSrc,
        imageAlt: imageSrc
          ? `Artwork preview of ${title}`
          : `Auction lot ${onChainOrderId}`,
        categoryKey,
      },
    };
  }

  private async reconcileOrderProjection(
    order: Order,
    chainAuction: AuctionCoreDto | null,
  ): Promise<Order> {
    if (!chainAuction) {
      return order;
    }

    const patch = this.buildOnChainProjectionPatch(order, chainAuction);
    if (!patch) {
      return order;
    }

    this.logger.log(
      `Repairing auction order projection ${order.onChainOrderId}: ${order.status} -> ${patch.status ?? order.status}`,
    );
    await this.orderRepo.update(order.id, patch);
    return Object.assign(order, patch);
  }

  private buildOnChainProjectionPatch(
    order: Order,
    chainAuction: AuctionCoreDto,
  ): Partial<Order> | null {
    const patch: Partial<Order> = {};
    const nextState = chainAuction.state;
    const nextStatus = this.resolveOrderStatusFromEscrowState(
      nextState,
      order.status,
    );
    const nextPaymentStatus = this.resolvePaymentStatusFromEscrowState(
      nextState,
      order.paymentStatus,
    );
    const highestBidWei = chainAuction.highestBid?.toString();
    const highestBidder = this.normalizeAddress(chainAuction.highestBidder);

    if (order.escrowState !== nextState) {
      patch.escrowState = nextState;
    }
    if (nextStatus !== order.status) {
      patch.status = nextStatus;
    }
    if (nextPaymentStatus !== order.paymentStatus) {
      patch.paymentStatus = nextPaymentStatus;
    }
    if (
      highestBidWei &&
      highestBidWei !== '0' &&
      highestBidWei !== order.bidAmountWei
    ) {
      patch.bidAmountWei = highestBidWei;
      Object.assign(patch, this.getBidAmountTotals(highestBidWei));
    }
    if (
      highestBidder &&
      highestBidder !== ZERO_ADDRESS &&
      highestBidder !== this.normalizeAddress(order.buyerWallet)
    ) {
      patch.buyerWallet = highestBidder;
    }

    return Object.keys(patch).length > 0 ? patch : null;
  }

  private resolveOrderStatusFromEscrowState(
    escrowState: EscrowState,
    currentStatus: OrderStatus,
  ): OrderStatus {
    switch (escrowState) {
      case EscrowState.ENDED:
        return OrderStatus.ESCROW_HELD;
      case EscrowState.SHIPPED:
        return OrderStatus.SHIPPED;
      case EscrowState.DISPUTED:
        return OrderStatus.DISPUTE_OPEN;
      case EscrowState.COMPLETED:
        return OrderStatus.DELIVERED;
      case EscrowState.CANCELLED:
        return OrderStatus.CANCELLED;
      case EscrowState.STARTED:
      default:
        return currentStatus;
    }
  }

  private resolvePaymentStatusFromEscrowState(
    escrowState: EscrowState,
    currentStatus: OrderPaymentStatus,
  ): OrderPaymentStatus {
    switch (escrowState) {
      case EscrowState.ENDED:
      case EscrowState.SHIPPED:
      case EscrowState.DISPUTED:
        return OrderPaymentStatus.ESCROW;
      case EscrowState.COMPLETED:
        return OrderPaymentStatus.RELEASED;
      case EscrowState.CANCELLED:
        return OrderPaymentStatus.REFUNDED;
      case EscrowState.STARTED:
      default:
        return currentStatus;
    }
  }

  private async getOnChainAuction(
    order: Order,
  ): Promise<AuctionCoreDto | null> {
    if (!order.onChainOrderId) {
      return null;
    }

    try {
      return await this.escrowContractService.getAuction(order.onChainOrderId);
    } catch (error) {
      this.logger.warn(
        `Falling back to synced order state for auction ${order.onChainOrderId}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  private resolveCurrentBidWei(
    order: Order,
    chainAuction: AuctionCoreDto | null,
  ) {
    return chainAuction?.highestBid?.toString() ?? order.bidAmountWei ?? '0';
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

  private resolveEndsAt(order: Order, chainAuction: AuctionCoreDto | null) {
    if (chainAuction?.endTime) {
      return new Date(Number(chainAuction.endTime) * 1000).toISOString();
    }
    return (
      order.estimatedDeliveryDate ??
      order.createdAt ??
      new Date()
    ).toISOString();
  }

  private resolveStatusKey(
    order: Order,
    chainAuction: AuctionCoreDto | null,
    endsAt: string,
  ): AuctionStatusKey {
    const escrowState = chainAuction?.state ?? order.escrowState;
    if (
      escrowState === EscrowState.CANCELLED ||
      escrowState === EscrowState.COMPLETED ||
      order.status === 'cancelled' ||
      order.status === 'delivered' ||
      order.status === 'refunded'
    ) {
      return AuctionStatusKey.CLOSED;
    }
    if (
      escrowState === EscrowState.ENDED ||
      escrowState === EscrowState.SHIPPED
    ) {
      return AuctionStatusKey.CLOSED;
    }
    if (escrowState === EscrowState.DISPUTED) {
      return AuctionStatusKey.PAUSED;
    }

    const endsAtMs = new Date(endsAt).getTime();
    if (Number.isFinite(endsAtMs)) {
      const msUntilEnd = endsAtMs - Date.now();
      if (msUntilEnd <= 0) {
        return AuctionStatusKey.CLOSED;
      }
      if (msUntilEnd <= ONE_HOUR_MS) {
        return AuctionStatusKey.ENDING_SOON;
      }
    }
    const currentBidWei = this.resolveCurrentBidWei(order, chainAuction);
    if (!currentBidWei || currentBidWei === '0') {
      return AuctionStatusKey.NEWLY_LISTED;
    }
    return AuctionStatusKey.ACTIVE;
  }

  private resolveStatusLabel(statusKey: AuctionStatusKey) {
    switch (statusKey) {
      case AuctionStatusKey.ENDING_SOON:
        return 'Ending Soon';
      case AuctionStatusKey.NEWLY_LISTED:
        return 'Newly Listed';
      case AuctionStatusKey.PAUSED:
        return 'Paused';
      case AuctionStatusKey.CLOSED:
        return 'Closed';
      case AuctionStatusKey.ACTIVE:
      default:
        return 'Live Auction';
    }
  }

  private resolveCategory(filters: GetAuctionsDto, index: number) {
    return filters.category ?? CATEGORY_CYCLE[index % CATEGORY_CYCLE.length];
  }

  private normalizeAddress(address?: string | null) {
    return !address || address === ZERO_ADDRESS ? null : address;
  }

  private weiToEthNumber(wei: string) {
    return Number(ethers.formatEther(BigInt(wei)));
  }
}
