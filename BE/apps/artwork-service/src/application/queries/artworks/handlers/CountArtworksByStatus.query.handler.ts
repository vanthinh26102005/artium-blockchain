import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CountArtworksByStatusQuery } from '../CountArtworksByStatus.query';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(CountArtworksByStatusQuery)
export class CountArtworksByStatusHandler implements IQueryHandler<CountArtworksByStatusQuery> {
  private readonly logger = new Logger(CountArtworksByStatusHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(query: CountArtworksByStatusQuery) {
    const reqId = `q:countByStatus:${Date.now()}`;
    this.logger.debug(
      `[${reqId}] counting statuses for seller=${query.sellerId}`,
    );
    try {
      return await this.repo.countByStatus(query.sellerId);
    } catch (err) {
      this.logger.error(`[${reqId}] countByStatus failed`, err.stack || err);
      throw err;
    }
  }
}
