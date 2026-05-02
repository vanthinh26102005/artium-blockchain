import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrderRepository } from '../../../domain/interfaces';
import { GetArtworkOrderLocksQuery } from '../GetArtworkOrderLocks.query';

export type ArtworkOrderLocksResult = {
  artworkIds: string[];
};

@QueryHandler(GetArtworkOrderLocksQuery)
export class GetArtworkOrderLocksHandler implements IQueryHandler<GetArtworkOrderLocksQuery> {
  private readonly logger = new Logger(GetArtworkOrderLocksHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(
    query: GetArtworkOrderLocksQuery,
  ): Promise<ArtworkOrderLocksResult> {
    this.logger.debug('Getting active artwork order locks', {
      sellerId: query.sellerId,
      artworkCount: query.artworkIds.length,
    });

    const artworkIds = await this.orderRepo.findActiveArtworkLocks(
      query.sellerId,
      query.artworkIds,
    );

    return { artworkIds };
  }
}
