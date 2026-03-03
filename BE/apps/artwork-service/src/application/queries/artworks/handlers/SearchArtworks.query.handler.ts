import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SearchArtworksQuery } from '../SearchArtworks.query';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(SearchArtworksQuery)
export class SearchArtworksHandler implements IQueryHandler<SearchArtworksQuery> {
  private readonly logger = new Logger(SearchArtworksHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(query: SearchArtworksQuery) {
    const reqId = `q:search:${Date.now()}`;
    this.logger.debug(
      `[${reqId}] search seller=${query.sellerId} q=${query.q}`,
    );
    try {
      return await this.repo.search(query.sellerId, query.q, query.opts);
    } catch (err) {
      this.logger.error(`[${reqId}] search failed`, err.stack || err);
      throw err;
    }
  }
}
