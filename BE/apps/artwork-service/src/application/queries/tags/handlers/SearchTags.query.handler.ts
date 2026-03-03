import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { SearchTagsQuery } from '../SearchTags.query';
import { ITagRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(SearchTagsQuery)
export class SearchTagsHandler implements IQueryHandler<SearchTagsQuery> {
  private readonly logger = new Logger(SearchTagsHandler.name);

  constructor(@Inject(ITagRepository) private readonly repo: ITagRepository) {}

  async execute(query: SearchTagsQuery) {
    const { sellerId, q, limit } = query;
    this.logger.debug(`Executing SearchTagsQuery: ${JSON.stringify(query)}`);

    try {
      const tags = await this.repo.searchForSeller(sellerId ?? '', q, limit);
      this.logger.debug(
        `Found ${tags.length} tags for sellerId=${sellerId ?? 'N/A'}`,
      );
      return tags;
    } catch (error) {
      this.logger.error(
        `Failed to search tags for sellerId=${sellerId ?? 'N/A'} with query="${q}": ${error.message}`,
        error.stack,
      );
      throw RpcExceptionHelper.internalError(
        'Error occurred while searching for tags',
      );
    }
  }
}
