import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { FindArtworksByTagsQuery } from '../FindArtworksByTags.query';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(FindArtworksByTagsQuery)
export class FindArtworksByTagsHandler implements IQueryHandler<FindArtworksByTagsQuery> {
  private readonly logger = new Logger(FindArtworksByTagsHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(query: FindArtworksByTagsQuery) {
    const reqId = `q:tags:${Date.now()}`;
    this.logger.debug(
      `[${reqId}] find by tags seller=${query.sellerId} tags=${query.tagIds.length}`,
    );
    try {
      return await this.repo.findManyByTags(
        query.sellerId,
        query.tagIds,
        query.options,
        query.paging,
      );
    } catch (err) {
      this.logger.error(`[${reqId}] findByTags failed`, err.stack || err);
      throw err;
    }
  }
}
