import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListTagsQuery } from '../ListTags.query';
import { ITagRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(ListTagsQuery)
export class ListTagsHandler implements IQueryHandler<ListTagsQuery> {
  private readonly logger = new Logger(ListTagsHandler.name);
  constructor(@Inject(ITagRepository) private readonly repo: ITagRepository) {}

  async execute(query: ListTagsQuery) {
    const { sellerId, status, skip, take } = query.params ?? {};
    const where: any = {};
    if (sellerId) where.sellerId = { $eq: sellerId };
    if (status) where.status = { $eq: status };

    return this.repo.find({ where, skip, take });
  }
}
