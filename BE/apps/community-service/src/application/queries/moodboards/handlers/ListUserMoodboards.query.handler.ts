import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListUserMoodboardsQuery } from '../ListUserMoodboards.query';
import { IMoodboardRepository, Moodboard } from '../../../../domain';

@QueryHandler(ListUserMoodboardsQuery)
export class ListUserMoodboardsHandler implements IQueryHandler<
  ListUserMoodboardsQuery,
  Moodboard[]
> {
  private readonly logger = new Logger(ListUserMoodboardsHandler.name);

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
  ) {}

  async execute(query: ListUserMoodboardsQuery): Promise<Moodboard[]> {
    this.logger.debug(`Listing moodboards for user: ${query.userId}`);

    const options = query.options || {};

    if (options.includePrivate) {
      return this.moodboardRepository.findByUserId(query.userId, {
        skip: options.skip,
        take: options.take ?? 20,
        orderBy: { displayOrder: 'asc', createdAt: 'desc' },
      });
    }

    return this.moodboardRepository.findPublicByUserId(query.userId, {
      skip: options.skip,
      take: options.take ?? 20,
      orderBy: { displayOrder: 'asc', createdAt: 'desc' },
    });
  }
}
