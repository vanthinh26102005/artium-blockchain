import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ArtworkStatus,
  SellerAuctionArtworkCandidateObject,
  SellerAuctionArtworkCandidatesResponse,
  SellerAuctionArtworkEligibilityReason,
  SellerAuctionArtworkRecoveryActionObject,
} from '@app/common';
import { Artwork } from '../../../../domain/entities/artworks.entity';
import { IArtworkRepository } from '../../../../domain/interfaces/artwork.repository.interface';
import { ListSellerAuctionArtworkCandidatesQuery } from '../ListSellerAuctionArtworkCandidates.query';

const RECOVERY_COPY: Record<
  SellerAuctionArtworkEligibilityReason,
  SellerAuctionArtworkRecoveryActionObject
> = {
  [SellerAuctionArtworkEligibilityReason.NOT_ACTIVE]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.NOT_ACTIVE,
    message: 'Artwork is not active',
    actionLabel: 'Publish or activate this artwork before auctioning it.',
  },
  [SellerAuctionArtworkEligibilityReason.NOT_PUBLISHED]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.NOT_PUBLISHED,
    message: 'Artwork is not published',
    actionLabel: 'Publish the artwork from inventory.',
  },
  [SellerAuctionArtworkEligibilityReason.SOLD]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.SOLD,
    message: 'Artwork is already sold',
    actionLabel: 'Sold artworks cannot be auctioned again.',
  },
  [SellerAuctionArtworkEligibilityReason.DELETED]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.DELETED,
    message: 'Artwork is deleted',
    actionLabel: 'Restore or recreate the artwork before auctioning it.',
  },
  [SellerAuctionArtworkEligibilityReason.RESERVED]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.RESERVED,
    message: 'Artwork is reserved',
    actionLabel: 'Clear the reservation before starting an auction.',
  },
  [SellerAuctionArtworkEligibilityReason.IN_AUCTION]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.IN_AUCTION,
    message: 'Artwork is already in auction',
    actionLabel: 'Manage the existing auction instead.',
  },
  [SellerAuctionArtworkEligibilityReason.HAS_ON_CHAIN_AUCTION]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.HAS_ON_CHAIN_AUCTION,
    message: 'Auction already exists on-chain',
    actionLabel: 'Use the existing auction record.',
  },
  [SellerAuctionArtworkEligibilityReason.ACTIVE_ORDER_LOCK]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.ACTIVE_ORDER_LOCK,
    message: 'Artwork has an active order',
    actionLabel: 'Resolve the order before auctioning it.',
  },
  [SellerAuctionArtworkEligibilityReason.MULTI_QUANTITY]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.MULTI_QUANTITY,
    message: 'Multiple quantities are not supported',
    actionLabel: 'Use a single-edition artwork for auctions.',
  },
  [SellerAuctionArtworkEligibilityReason.MISSING_PRIMARY_IMAGE]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.MISSING_PRIMARY_IMAGE,
    message: 'Primary image is missing',
    actionLabel: 'Add a primary image in inventory.',
  },
  [SellerAuctionArtworkEligibilityReason.MISSING_METADATA]: {
    reasonCode: SellerAuctionArtworkEligibilityReason.MISSING_METADATA,
    message: 'Required artwork details are incomplete',
    actionLabel: 'Add title, creator, and display details before auctioning.',
  },
};

@QueryHandler(ListSellerAuctionArtworkCandidatesQuery)
export class ListSellerAuctionArtworkCandidatesHandler implements IQueryHandler<ListSellerAuctionArtworkCandidatesQuery> {
  private readonly logger = new Logger(
    ListSellerAuctionArtworkCandidatesHandler.name,
  );

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(
    query: ListSellerAuctionArtworkCandidatesQuery,
  ): Promise<SellerAuctionArtworkCandidatesResponse> {
    const reqId = `q:seller-auction-candidates:${Date.now()}`;
    this.logger.debug(`[${reqId}] list seller auction candidates`, {
      sellerId: query.sellerId,
    });

    const artworks = await this.repo.findManyBySellerId(query.sellerId, {
      orderBy: { createdAt: 'desc' },
    });
    const candidates = artworks.map((artwork) => this.toCandidate(artwork));
    const eligible = candidates.filter((candidate) => candidate.isEligible);
    const blocked = candidates.filter((candidate) => !candidate.isEligible);

    return {
      eligible,
      blocked,
      total: candidates.length,
      eligibleCount: eligible.length,
      blockedCount: blocked.length,
    };
  }

  private toCandidate(artwork: Artwork): SellerAuctionArtworkCandidateObject {
    const reasonCodes = this.getReasonCodes(artwork);
    const primaryImage = artwork.images?.find(
      (image) => image.isPrimary === true,
    );

    return {
      artworkId: artwork.id,
      sellerId: artwork.sellerId,
      title: artwork.title,
      creatorName: artwork.creatorName ?? '',
      thumbnailUrl: primaryImage?.secureUrl ?? primaryImage?.url ?? null,
      status: artwork.status,
      isPublished: artwork.isPublished,
      quantity: artwork.quantity,
      onChainAuctionId: artwork.onChainAuctionId ?? null,
      isEligible: reasonCodes.length === 0,
      reasonCodes,
      recoveryActions: reasonCodes.map(
        (reasonCode) => RECOVERY_COPY[reasonCode],
      ),
    };
  }

  private getReasonCodes(
    artwork: Artwork,
  ): SellerAuctionArtworkEligibilityReason[] {
    const reasons: SellerAuctionArtworkEligibilityReason[] = [];
    const add = (reason: SellerAuctionArtworkEligibilityReason) => {
      if (!reasons.includes(reason)) {
        reasons.push(reason);
      }
    };

    switch (artwork.status) {
      case ArtworkStatus.SOLD:
        add(SellerAuctionArtworkEligibilityReason.SOLD);
        break;
      case ArtworkStatus.DELETED:
        add(SellerAuctionArtworkEligibilityReason.DELETED);
        break;
      case ArtworkStatus.RESERVED:
        add(SellerAuctionArtworkEligibilityReason.RESERVED);
        break;
      case ArtworkStatus.IN_AUCTION:
        add(SellerAuctionArtworkEligibilityReason.IN_AUCTION);
        break;
      case ArtworkStatus.ACTIVE:
        break;
      default:
        add(SellerAuctionArtworkEligibilityReason.NOT_ACTIVE);
        break;
    }

    if (artwork.isPublished !== true) {
      add(SellerAuctionArtworkEligibilityReason.NOT_PUBLISHED);
    }

    if (this.hasText(artwork.onChainAuctionId)) {
      add(SellerAuctionArtworkEligibilityReason.HAS_ON_CHAIN_AUCTION);
    }

    if (artwork.quantity !== 1) {
      add(SellerAuctionArtworkEligibilityReason.MULTI_QUANTITY);
    }

    if (!artwork.images?.some((image) => image.isPrimary === true)) {
      add(SellerAuctionArtworkEligibilityReason.MISSING_PRIMARY_IMAGE);
    }

    if (!this.hasText(artwork.title) || !this.hasText(artwork.creatorName)) {
      add(SellerAuctionArtworkEligibilityReason.MISSING_METADATA);
    }

    return reasons;
  }

  private hasText(value: string | null | undefined): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
