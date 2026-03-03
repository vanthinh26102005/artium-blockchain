import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetArtworkQuery } from '../GetArtwork.query';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(GetArtworkQuery)
export class GetArtworkHandler implements IQueryHandler<GetArtworkQuery> {
  private readonly logger = new Logger(GetArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(query: GetArtworkQuery) {
    const reqId = `q:get:${Date.now()}`;
    this.logger.debug(`[${reqId}] get artwork ${query.id}`);
    try {
      return await this.repo.findById(query.id);
    } catch (err) {
      this.logger.error(`[${reqId}] get failed`, err.stack || err);
      throw err;
    }
  }
}
