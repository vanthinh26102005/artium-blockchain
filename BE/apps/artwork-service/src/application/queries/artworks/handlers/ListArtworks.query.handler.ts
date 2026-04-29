import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ArtworkStatus, SellerAuctionStartStatusObject } from '@app/common';
import { ListArtworksQuery } from '../ListArtworks.query';
import { IArtworkRepository } from '../../../../domain/interfaces/artwork.repository.interface';
import { IArtworkAuctionLifecycleRepository } from '../../../../domain/interfaces/artwork-auction-lifecycle.repository.interface';
import { PaginatedResponse } from '../../../../domain/dtos/common/paginated-response.dto';

@QueryHandler(ListArtworksQuery)
export class ListArtworksHandler implements IQueryHandler<ListArtworksQuery> {
  private readonly logger = new Logger(ListArtworksHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
    @Inject(IArtworkAuctionLifecycleRepository)
    private readonly lifecycleRepo: IArtworkAuctionLifecycleRepository,
  ) {}

  private getDisplayStatus(status: ArtworkStatus): 'Draft' | 'Hidden' {
    switch (status) {
      case ArtworkStatus.SOLD:
      case ArtworkStatus.RESERVED:
      case ArtworkStatus.INACTIVE:
      case ArtworkStatus.DELETED:
        return 'Hidden';
      case ArtworkStatus.DRAFT:
      case ArtworkStatus.ACTIVE:
      case ArtworkStatus.PENDING_REVIEW:
      default:
        return 'Draft';
    }
  }

  async execute(query: ListArtworksQuery) {
    const reqId = `q:list:${Date.now()}`;
    this.logger.debug(`[${reqId}] list artworks`, { options: query.options });
    try {
      const {
        skip = 0,
        take = 20,
        folderId,
        sortBy,
        sortOrder,
        q,
        minPrice,
        maxPrice,
        includeSellerAuctionLifecycle,
        ...restOptions
      } = query.options;

      const where: any = { ...restOptions };

      if (folderId !== undefined) {
        if (folderId === 'null' || folderId === null) {
          where.folderId = null;
        } else {
          where.folderId = folderId;
        }
      }

      // Handle search query separately (not a direct entity property)
      // This will be handled by the repository implementation

      // Handle price range filters
      if (minPrice !== undefined || maxPrice !== undefined) {
        // These will be handled by the repository implementation
      }

      const orderBy: any = {};
      if (sortBy) {
        const direction = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        orderBy[sortBy] = direction;
      } else {
        orderBy.createdAt = 'DESC';
      }

      const [artworks, total] = await this.repo.findAndCount({
        where,
        skip,
        take,
        orderBy,
        searchQuery: q,
        minPrice,
        maxPrice,
      });

      const shouldIncludeAuctionLifecycle =
        includeSellerAuctionLifecycle === true &&
        typeof restOptions.sellerId === 'string' &&
        restOptions.sellerId.length > 0;
      const sellerIdForLifecycle = shouldIncludeAuctionLifecycle
        ? restOptions.sellerId
        : null;

      const auctionLifecycleByArtworkId = sellerIdForLifecycle
        ? await this.safeLoadAuctionLifecycleByArtworkId(
            sellerIdForLifecycle,
            artworks,
            reqId,
          )
        : new Map<string, SellerAuctionStartStatusObject | null>();

      const artworkObjects = artworks.map((artwork) => ({
        ...artwork,
        thumbnailUrl: artwork.images?.[0]?.secureUrl || null,
        displayStatus: this.getDisplayStatus(artwork.status),
        auctionLifecycle: auctionLifecycleByArtworkId.get(artwork.id) ?? null,
      }));

      return PaginatedResponse.create(artworkObjects, total, skip, take);
    } catch (err) {
      this.logger.error(`[${reqId}] list failed`, err.stack || err);
      throw err;
    }
  }

  private async safeLoadAuctionLifecycleByArtworkId(
    sellerId: string,
    artworks: Array<{ id: string }>,
    reqId: string,
  ): Promise<Map<string, SellerAuctionStartStatusObject | null>> {
    try {
      return await this.loadAuctionLifecycleByArtworkId(sellerId, artworks);
    } catch (err) {
      const error = err as Error;
      this.logger.warn(
        `[${reqId}] auction lifecycle enrichment unavailable for seller=${sellerId}: ${
          error.message || err
        }`,
      );
      return new Map<string, SellerAuctionStartStatusObject | null>();
    }
  }

  private async loadAuctionLifecycleByArtworkId(
    sellerId: string,
    artworks: Array<{ id: string }>,
  ): Promise<Map<string, SellerAuctionStartStatusObject | null>> {
    const lifecycles = await this.lifecycleRepo.findBySellerAndArtworkIds(
      sellerId,
      artworks.map((artwork) => artwork.id),
    );

    return new Map(
      lifecycles.map((lifecycle) => [lifecycle.artworkId, lifecycle] as const),
    );
  }
}
