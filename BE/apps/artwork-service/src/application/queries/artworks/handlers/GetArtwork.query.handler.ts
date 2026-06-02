import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetArtworkQuery } from '../GetArtwork.query';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';
import { IArtworkAuctionLifecycleRepository } from '../../../../domain/interfaces/artwork-auction-lifecycle.repository.interface';

@QueryHandler(GetArtworkQuery)
export class GetArtworkHandler implements IQueryHandler<GetArtworkQuery> {
  private readonly logger = new Logger(GetArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
    @Inject(IArtworkAuctionLifecycleRepository)
    private readonly lifecycleRepo: IArtworkAuctionLifecycleRepository,
  ) {}

  async execute(query: GetArtworkQuery) {
    const reqId = `q:get:${Date.now()}`;
    this.logger.debug(`[${reqId}] get artwork ${query.id}`);
    try {
      const artwork = await this.repo.findById(query.id);
      if (!artwork) {
        return null;
      }

      const auctionLifecycle = await this.lifecycleRepo.findBySellerAndArtworkId(
        artwork.sellerId,
        artwork.id,
      );

      return {
        ...artwork,
        thumbnailUrl: artwork.images?.[0]?.secureUrl || null,
        auctionLifecycle,
      };
    } catch (err) {
      this.logger.error(`[${reqId}] get failed`, err.stack || err);
      throw err;
    }
  }
}
