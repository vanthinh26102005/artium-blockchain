import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListUserMoodboardsQuery } from '../ListUserMoodboards.query';
import {
  IMoodboardMediaRepository,
  IMoodboardRepository,
  Moodboard,
} from '../../../../domain';

@QueryHandler(ListUserMoodboardsQuery)
export class ListUserMoodboardsHandler implements IQueryHandler<
  ListUserMoodboardsQuery,
  Moodboard[]
> {
  private readonly logger = new Logger(ListUserMoodboardsHandler.name);

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
    @Inject(IMoodboardMediaRepository)
    private readonly moodboardMediaRepository: IMoodboardMediaRepository,
  ) {}

  async execute(query: ListUserMoodboardsQuery): Promise<Moodboard[]> {
    this.logger.debug(`Listing moodboards for user: ${query.userId}`);

    const options = query.options || {};

    const moodboards = options.includePrivate
      ? await this.moodboardRepository.findByUserId(query.userId, {
          skip: options.skip,
          take: options.take ?? 20,
          orderBy: { displayOrder: 'asc', createdAt: 'desc' },
        })
      : await this.moodboardRepository.findPublicByUserId(query.userId, {
          skip: options.skip,
          take: options.take ?? 20,
          orderBy: { displayOrder: 'asc', createdAt: 'desc' },
        });

    return Promise.all(
      moodboards.map(async (moodboard) => ({
        ...moodboard,
        media: await this.moodboardMediaRepository.findByMoodboardId(
          moodboard.id,
        ),
      })),
    );
  }
}
