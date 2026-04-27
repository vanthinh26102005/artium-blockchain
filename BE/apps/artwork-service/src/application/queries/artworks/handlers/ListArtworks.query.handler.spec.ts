import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { of } from 'rxjs';
import {
  ArtworkStatus,
  SellerAuctionStartStatus,
} from '@app/common';
import { ListArtworksQuery } from '../ListArtworks.query';
import { ListArtworksHandler } from './ListArtworks.query.handler';

describe('ListArtworksHandler', () => {
  const repo = {
    findAndCount: jest.fn(),
  };

  const ordersClient = {
    send: jest.fn(),
  };

  let handler: ListArtworksHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new ListArtworksHandler(repo as never, ordersClient as never);
  });

  it('enriches seller artwork rows with auction lifecycle when requested', async () => {
    repo.findAndCount.mockResolvedValue([
      [
        {
          id: 'artwork-1',
          sellerId: 'seller-1',
          title: 'Ocean Study',
          status: ArtworkStatus.ACTIVE,
          images: [{ secureUrl: 'https://example.com/art.jpg' }],
        },
      ],
      1,
    ] as never);
    ordersClient.send.mockReturnValue(
      of({
        attemptId: 'attempt-1',
        sellerId: 'seller-1',
        artworkId: 'artwork-1',
        orderId: 'order-1',
        status: SellerAuctionStartStatus.PENDING_START,
        artworkTitle: 'Ocean Study',
        creatorName: 'Artium Seller',
        thumbnailUrl: 'https://example.com/art.jpg',
        contractAddress: '0x00000000000000000000000000000000000000aa',
        txHash: null,
        walletAddress: null,
        reasonCode: null,
        reasonMessage: null,
        retryAllowed: false,
        editAllowed: false,
        walletActionRequired: true,
        submittedTermsSnapshot: {
          reservePolicy: 'set',
          reservePriceEth: '1.5',
          minBidIncrementEth: '0.1',
          durationHours: 72,
          shippingDisclosure: 'Ships in 5 business days',
          paymentDisclosure: 'Payment due immediately',
          economicsLockedAcknowledged: true,
        },
        transactionRequest: {
          contractAddress: '0x00000000000000000000000000000000000000aa',
          data: '0xfeedface',
        },
        activatedAt: null,
        updatedAt: '2026-04-27T08:00:00.000Z',
      }),
    );

    const result = await handler.execute(
      new ListArtworksQuery({
        sellerId: 'seller-1',
        includeSellerAuctionLifecycle: true,
      }),
    );

    expect(ordersClient.send).toHaveBeenCalledWith(
      { cmd: 'get_seller_auction_start_status' },
      {
        sellerId: 'seller-1',
        artworkId: 'artwork-1',
      },
    );
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: 'artwork-1',
        thumbnailUrl: 'https://example.com/art.jpg',
        displayStatus: 'Draft',
        auctionLifecycle: expect.objectContaining({
          artworkId: 'artwork-1',
          status: SellerAuctionStartStatus.PENDING_START,
        }),
      }),
    );
  });

  it('does not request seller auction lifecycle for standard artwork queries', async () => {
    repo.findAndCount.mockResolvedValue([
      [
        {
          id: 'artwork-1',
          sellerId: 'seller-1',
          title: 'Ocean Study',
          status: ArtworkStatus.ACTIVE,
          images: [],
        },
      ],
      1,
    ] as never);

    const result = await handler.execute(
      new ListArtworksQuery({
        sellerId: 'seller-1',
      }),
    );

    expect(ordersClient.send).not.toHaveBeenCalled();
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        auctionLifecycle: null,
      }),
    );
  });
});
