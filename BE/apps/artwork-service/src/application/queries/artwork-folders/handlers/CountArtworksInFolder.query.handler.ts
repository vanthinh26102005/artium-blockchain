import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CountArtworksInFolderQuery } from '../CountArtworksInFolder.query';
import { IArtworkFolderRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(CountArtworksInFolderQuery)
export class CountArtworksInFolderHandler implements IQueryHandler<CountArtworksInFolderQuery> {
  private readonly logger = new Logger(CountArtworksInFolderHandler.name);
  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly repo: IArtworkFolderRepository,
  ) {}

  async execute(query: CountArtworksInFolderQuery) {
    const reqId = `countArtworksInFolder:${Date.now()}`;
    this.logger.debug(`[${reqId}] start folder=${query.folderId}`);
    const count = await this.repo.countArtworksRecursive(query.folderId);
    this.logger.debug(`[${reqId}] result=${count}`);
    return count;
  }
}
