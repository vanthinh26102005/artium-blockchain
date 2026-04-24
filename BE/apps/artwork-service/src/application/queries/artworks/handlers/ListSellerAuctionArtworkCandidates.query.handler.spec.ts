import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  ArtworkStatus,
  SellerAuctionArtworkEligibilityReason,
} from '@app/common';
import { Artwork } from '../../../../domain/entities/artworks.entity';
import { ListSellerAuctionArtworkCandidatesQuery } from '../ListSellerAuctionArtworkCandidates.query';
import { ListSellerAuctionArtworkCandidatesHandler } from './ListSellerAuctionArtworkCandidates.query.handler';

describe('ListSellerAuctionArtworkCandidatesHandler', () => {
  const sellerId = 'seller-1';
  const repo = {
    findManyBySellerId: jest.fn(),
  };

  let handler: ListSellerAuctionArtworkCandidatesHandler;

  const artwork = (overrides: Partial<Artwork> = {}): Artwork =>
    ({
      id: 'artwork-1',
      sellerId,
      title: 'Auction Piece',
      creatorName: 'Artium Artist',
      status: ArtworkStatus.ACTIVE,
      isPublished: true,
      quantity: 1,
      images: [
        {
          id: 'image-1',
          publicId: 'artwork/image-1',
          url: 'https://cdn.example.com/image-1.jpg',
          secureUrl: 'https://cdn.example.com/image-1.jpg',
          isPrimary: true,
        },
      ],
      onChainAuctionId: null,
      ...overrides,
    }) as Artwork;

  beforeEach(() => {
    repo.findManyBySellerId = jest.fn();
    handler = new ListSellerAuctionArtworkCandidatesHandler(repo as never);
  });

  it('groups eligible owned artwork', async () => {
    repo.findManyBySellerId.mockResolvedValue([artwork()] as never);

    const result = await handler.execute(
      new ListSellerAuctionArtworkCandidatesQuery(sellerId),
    );

    expect(repo.findManyBySellerId).toHaveBeenCalledWith(sellerId, {
      orderBy: { createdAt: 'desc' },
    });
    expect(result.eligibleCount).toBe(1);
    expect(result.blockedCount).toBe(0);
    expect(result.eligible[0]).toMatchObject({
      artworkId: 'artwork-1',
      sellerId,
      isEligible: true,
      reasonCodes: [],
    });
  });

  it.each([
    [ArtworkStatus.SOLD, SellerAuctionArtworkEligibilityReason.SOLD],
    [ArtworkStatus.DELETED, SellerAuctionArtworkEligibilityReason.DELETED],
    [ArtworkStatus.RESERVED, SellerAuctionArtworkEligibilityReason.RESERVED],
    [ArtworkStatus.IN_AUCTION, SellerAuctionArtworkEligibilityReason.IN_AUCTION],
    [ArtworkStatus.DRAFT, SellerAuctionArtworkEligibilityReason.NOT_ACTIVE],
    [ArtworkStatus.INACTIVE, SellerAuctionArtworkEligibilityReason.NOT_ACTIVE],
  ])('blocks %s lifecycle as %s', async (status, reasonCode) => {
    repo.findManyBySellerId.mockResolvedValue([artwork({ status })] as never);

    const result = await handler.execute(
      new ListSellerAuctionArtworkCandidatesQuery(sellerId),
    );

    expect(result.eligibleCount).toBe(0);
    expect(result.blockedCount).toBe(1);
    expect(result.blocked[0].reasonCodes).toContain(reasonCode);
    expect(result.blocked[0].recoveryActions).toEqual(
      expect.arrayContaining([expect.objectContaining({ reasonCode })]),
    );
  });

  it.each([
    [
      { isPublished: false },
      SellerAuctionArtworkEligibilityReason.NOT_PUBLISHED,
    ],
    [
      { onChainAuctionId: '0x01' },
      SellerAuctionArtworkEligibilityReason.HAS_ON_CHAIN_AUCTION,
    ],
    [{ quantity: 2 }, SellerAuctionArtworkEligibilityReason.MULTI_QUANTITY],
    [
      {
        images: [
          {
            id: 'image-1',
            publicId: 'artwork/image-1',
            url: 'https://cdn.example.com/image-1.jpg',
            secureUrl: 'https://cdn.example.com/image-1.jpg',
            isPrimary: false,
          },
        ],
      },
      SellerAuctionArtworkEligibilityReason.MISSING_PRIMARY_IMAGE,
    ],
    [
      { creatorName: '   ' },
      SellerAuctionArtworkEligibilityReason.MISSING_METADATA,
    ],
  ])('blocks intrinsic metadata issue %o as %s', async (overrides, reasonCode) => {
    repo.findManyBySellerId.mockResolvedValue([
      artwork(overrides as Partial<Artwork>),
    ] as never);

    const result = await handler.execute(
      new ListSellerAuctionArtworkCandidatesQuery(sellerId),
    );

    expect(result.eligibleCount).toBe(0);
    expect(result.blockedCount).toBe(1);
    expect(result.blocked[0].reasonCodes).toContain(reasonCode);
    expect(result.blocked[0].recoveryActions).toEqual(
      expect.arrayContaining([expect.objectContaining({ reasonCode })]),
    );
  });
});
