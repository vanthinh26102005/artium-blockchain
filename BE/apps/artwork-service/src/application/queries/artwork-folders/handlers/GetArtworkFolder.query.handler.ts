import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IArtworkFolderRepository } from 'apps/artwork-service/src/domain';
import { GetArtworkFolderQuery } from '../GetArtworkFolder.query';

@QueryHandler(GetArtworkFolderQuery)
export class GetArtworkFolderHandler implements IQueryHandler<GetArtworkFolderQuery> {
  private readonly logger = new Logger(GetArtworkFolderHandler.name);
  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly repo: IArtworkFolderRepository,
  ) {}

  async execute(query: GetArtworkFolderQuery) {
    const reqId = `getFolder:${Date.now()}`;
    this.logger.debug(`[${reqId}] start id=${query.id}`);
    const folder = await this.repo.findById(query.id);
    if (!folder) {
      this.logger.debug(`[${reqId}] not found id=${query.id}`);
      return null;
    }
    this.logger.debug(`[${reqId}] ok id=${query.id}`);
    return folder;
  }
}
