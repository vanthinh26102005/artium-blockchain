import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuctionStatusKey, EscrowState, OrderPaymentMethod, OrderStatus } from '@app/common';

jest.mock(
  '@app/blockchain',
  () => ({
    EscrowContractService: class EscrowContractService {},
  }),
  { virtual: true },
);

import { GetAuctionsQuery } from '../GetAuctions.query';
import { GetAuctionsHandler } from './GetAuctions.query.handler';

describe('GetAuctionsHandler', () => {
  const orderRepo = {
    find: jest.fn(),
    count: jest.fn(),
    findWithItems: jest.fn(),
  };
  const escrowContractService = {
    getAuction: jest.fn(),
  };

  let handler: GetAuctionsHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    escrowContractService.getAuction.mockResolvedValue({
      state: EscrowState.STARTED,
      highestBid: BigInt('2000000000000000000'),
      minBidIncrement: BigInt('100000000000000000'),
      endTime: BigInt(Math.floor(Date.now() / 1000) + 2 * 60 * 60),
      highestBidder: '0x3333333333333333333333333333333333333333',
      seller: '0x2222222222222222222222222222222222222222',
    } as never);
    handler = new GetAuctionsHandler(
      orderRepo as never,
      escrowContractService as never,
    );
  });

  it('requests only authoritative active auction rows and maps converged item data', async () => {
    orderRepo.find.mockResolvedValue([
      {
        id: 'order-1',
        onChainOrderId: 'AUC-001',
        status: OrderStatus.AUCTION_ACTIVE,
        paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
        sellerWallet: '0x2222222222222222222222222222222222222222',
        escrowState: EscrowState.STARTED,
        txHash:
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        createdAt: new Date('2026-04-27T08:00:00.000Z'),
        items: [
          {
            artworkId: 'artwork-1',
            artworkTitle: 'Ocean Study',
            artworkImageUrl: 'https://cdn.example.com/ocean.jpg',
          },
        ],
      },
    ] as never);
    orderRepo.count.mockResolvedValue(1 as never);
    orderRepo.findWithItems.mockResolvedValue(null as never);

    const result = await handler.execute(new GetAuctionsQuery({ take: 20, skip: 0 }));

    expect(orderRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          status: OrderStatus.AUCTION_ACTIVE,
          onChainOrderId: { $ne: null },
        },
        relations: ['items'],
      }),
    );
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      auctionId: 'AUC-001',
      onChainOrderId: 'AUC-001',
      statusKey: AuctionStatusKey.ACTIVE,
      artwork: {
        artworkId: 'artwork-1',
        title: 'Ocean Study',
        imageSrc: 'https://cdn.example.com/ocean.jpg',
      },
    });
  });

  it('drops rows that do not have converged artwork linkage', async () => {
    orderRepo.find.mockResolvedValue([
      {
        id: 'order-1',
        onChainOrderId: 'AUC-001',
        status: OrderStatus.AUCTION_ACTIVE,
        paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
        sellerWallet: '0x2222222222222222222222222222222222222222',
        escrowState: EscrowState.STARTED,
        createdAt: new Date('2026-04-27T08:00:00.000Z'),
        items: [],
      },
    ] as never);
    orderRepo.count.mockResolvedValue(1 as never);
    orderRepo.findWithItems.mockResolvedValue({
      id: 'order-1',
      onChainOrderId: 'AUC-001',
      items: [],
    } as never);

    const result = await handler.execute(new GetAuctionsQuery({ take: 20, skip: 0 }));

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(1);
  });
});
