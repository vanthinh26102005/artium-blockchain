import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetFolderTreeQuery } from '../GetFolderTree.query';
import { IArtworkFolderRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(GetFolderTreeQuery)
export class GetFolderTreeHandler implements IQueryHandler<GetFolderTreeQuery> {
  private readonly logger = new Logger(GetFolderTreeHandler.name);
  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly repo: IArtworkFolderRepository,
  ) {}

  async execute(query: GetFolderTreeQuery) {
    const reqId = `getTree:${Date.now()}`;
    this.logger.log(`[${reqId}] start seller=${query.sellerId}`);
    const tree = await this.repo.findFolderTree(query.sellerId);
    this.logger.log(
      `[${reqId}] roots=${Array.isArray(tree) ? tree.length : 0}`,
    );
    return tree;
  }
}
