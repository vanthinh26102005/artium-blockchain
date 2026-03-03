import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetTagQuery } from '../GetTag.query';
import { ITagRepository } from 'apps/artwork-service/src/domain';

@QueryHandler(GetTagQuery)
export class GetTagHandler implements IQueryHandler<GetTagQuery> {
  private readonly logger = new Logger(GetTagHandler.name);
  constructor(@Inject(ITagRepository) private readonly repo: ITagRepository) {}

  async execute(query: GetTagQuery) {
    return this.repo.findById(query.id);
  }
}
