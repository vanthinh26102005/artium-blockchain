import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { FindArtworksInFolderQuery } from '../FindArtworksInFolder.query';
import { IArtworkFolderRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(FindArtworksInFolderQuery)
export class FindArtworksInFolderHandler implements IQueryHandler<FindArtworksInFolderQuery> {
  private readonly logger = new Logger(FindArtworksInFolderHandler.name);
  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly repo: IArtworkFolderRepository,
  ) {}

  async execute(query: FindArtworksInFolderQuery) {
    const reqId = `findArtworksInFolder:${Date.now()}`;
    this.logger.debug(`[${reqId}] start folder=${query.folderId}`);
    const list = await this.repo.findArtworksInFolder(query.folderId);
    this.logger.debug(
      `[${reqId}] returned=${Array.isArray(list) ? list.length : 0}`,
    );
    return list;
  }
}
