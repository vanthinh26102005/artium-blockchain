import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { of } from 'rxjs';
import {
  EscrowState,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
  SellerAuctionReservePolicy,
  SellerAuctionStartStatus,
} from '@app/common';
import { BlockchainEventHandler } from './blockchain-event.handler';

describe('BlockchainEventHandler.handleAuctionStarted', () => {
  const orderRepo = {
    findByOnChainOrderId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const orderItemRepo = {
    findByOrderId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const startAttemptRepo = {
    findByOrderId: jest.fn(),
    update: jest.fn(),
  };
  const artworkClient = {
    send: jest.fn(),
  };

  let handler: BlockchainEventHandler;

  const startAttempt = {
    id: 'attempt-1',
    sellerId: 'seller-1',
    artworkId: 'artwork-1',
    orderId: 'AUC-001',
    status: SellerAuctionStartStatus.PENDING_START,
    artworkTitle: 'Ocean Study',
    creatorName: 'Artium Seller',
    thumbnailUrl: 'https://cdn.example.com/ocean.jpg',
    walletAddress: '0x1111111111111111111111111111111111111111',
    contractAddress: '0x00000000000000000000000000000000000000aa',
    txHash:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    reasonCode: null,
    reasonMessage: null,
    retryAllowed: false,
    editAllowed: false,
    walletActionRequired: true,
    activatedAt: null,
    durationSeconds: 72 * 60 * 60,
    reservePriceWei: '1500000000000000000',
    minBidIncrementWei: '100000000000000000',
    ipfsMetadataHash: 'QmHash',
    termsSnapshot: {
      reservePolicy: SellerAuctionReservePolicy.SET,
      reservePriceEth: '1.5',
      minBidIncrementEth: '0.1',
      durationHours: 72,
      shippingDisclosure: 'Ships in 5 business days',
      paymentDisclosure: 'Payment due immediately',
      economicsLockedAcknowledged: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    artworkClient.send.mockReturnValue(of({ id: 'artwork-1' }) as never);
    handler = new BlockchainEventHandler(
      orderRepo as never,
      orderItemRepo as never,
      startAttemptRepo as never,
      artworkClient as never,
    );
  });

  it('promotes a persisted start attempt into authoritative order and artwork state', async () => {
    startAttemptRepo.findByOrderId.mockResolvedValue(startAttempt as never);
    orderRepo.findByOnChainOrderId.mockResolvedValue(null as never);
    orderRepo.create.mockImplementation(async (data: any) => ({
      id: 'order-1',
      createdAt: new Date('2026-04-27T08:00:00.000Z'),
      updatedAt: new Date('2026-04-27T08:00:00.000Z'),
      ...data,
    }));
    orderItemRepo.findByOrderId.mockResolvedValue([] as never);
    orderItemRepo.create.mockImplementation(async (data: any) => ({
      id: 'item-1',
      createdAt: new Date('2026-04-27T08:00:00.000Z'),
      updatedAt: new Date('2026-04-27T08:00:00.000Z'),
      ...data,
    }));
    startAttemptRepo.update.mockResolvedValue({
      ...startAttempt,
      status: SellerAuctionStartStatus.AUCTION_ACTIVE,
    } as never);

    await handler.handleAuctionStarted({
      orderId: 'AUC-001',
      seller: '0x2222222222222222222222222222222222222222',
      endTime: '1777279200',
    });

    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderNumber: 'AUC-001',
        status: OrderStatus.AUCTION_ACTIVE,
        paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
        paymentStatus: OrderPaymentStatus.UNPAID,
        onChainOrderId: 'AUC-001',
        contractAddress: '0x00000000000000000000000000000000000000aa',
        txHash:
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        sellerWallet: '0x2222222222222222222222222222222222222222',
        escrowState: EscrowState.STARTED,
      }),
    );
    expect(orderItemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order-1',
        artworkId: 'artwork-1',
        sellerId: 'seller-1',
        artworkTitle: 'Ocean Study',
        artworkImageUrl: 'https://cdn.example.com/ocean.jpg',
      }),
    );
    expect(startAttemptRepo.update).toHaveBeenCalledWith(
      'attempt-1',
      expect.objectContaining({
        status: SellerAuctionStartStatus.AUCTION_ACTIVE,
        walletAddress: '0x2222222222222222222222222222222222222222',
        walletActionRequired: false,
      }),
    );
    expect(artworkClient.send).toHaveBeenCalledWith(
      { cmd: 'mark_artwork_in_auction' },
      {
        artworkId: 'artwork-1',
        sellerId: 'seller-1',
        onChainAuctionId: 'AUC-001',
      },
    );
  });

  it('keeps promotion idempotent under duplicate auction-started delivery', async () => {
    startAttemptRepo.findByOrderId.mockResolvedValue({
      ...startAttempt,
      status: SellerAuctionStartStatus.AUCTION_ACTIVE,
      activatedAt: new Date('2026-04-27T08:00:00.000Z'),
    } as never);
    orderRepo.findByOnChainOrderId.mockResolvedValue({
      id: 'order-1',
      onChainOrderId: 'AUC-001',
      status: OrderStatus.AUCTION_ACTIVE,
      paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
      paymentStatus: OrderPaymentStatus.UNPAID,
      sellerWallet: '0x2222222222222222222222222222222222222222',
      txHash:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      contractAddress: '0x00000000000000000000000000000000000000aa',
      escrowState: EscrowState.STARTED,
    } as never);
    orderRepo.update.mockResolvedValue({ id: 'order-1' } as never);
    orderItemRepo.findByOrderId.mockResolvedValue([
      {
        id: 'item-1',
        orderId: 'order-1',
        artworkId: 'artwork-1',
        sellerId: 'seller-1',
        artworkTitle: 'Ocean Study',
        artworkImageUrl: 'https://cdn.example.com/ocean.jpg',
        quantity: 1,
        currency: 'ETH',
        priceAtPurchase: 0,
      },
    ] as never);
    startAttemptRepo.update.mockResolvedValue({
      ...startAttempt,
      status: SellerAuctionStartStatus.AUCTION_ACTIVE,
    } as never);

    await handler.handleAuctionStarted({
      orderId: 'AUC-001',
      seller: '0x2222222222222222222222222222222222222222',
      endTime: '1777279200',
    });

    expect(orderRepo.create).not.toHaveBeenCalled();
    expect(orderItemRepo.create).not.toHaveBeenCalled();
    expect(orderItemRepo.update).not.toHaveBeenCalled();
    expect(startAttemptRepo.update).toHaveBeenCalledWith(
      'attempt-1',
      expect.objectContaining({
        status: SellerAuctionStartStatus.AUCTION_ACTIVE,
      }),
    );
    expect(artworkClient.send).toHaveBeenCalledTimes(1);
  });
});
