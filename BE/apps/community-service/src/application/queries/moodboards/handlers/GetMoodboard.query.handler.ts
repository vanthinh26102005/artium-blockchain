import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetMoodboardQuery } from '../GetMoodboard.query';
import {
  IMoodboardMediaRepository,
  IMoodboardRepository,
  Moodboard,
  MoodboardMedia,
  MoodboardObject,
} from '../../../../domain';

@QueryHandler(GetMoodboardQuery)
export class GetMoodboardHandler implements IQueryHandler<
  GetMoodboardQuery,
  MoodboardObject | null
> {
  private readonly logger = new Logger(GetMoodboardHandler.name);

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
    @Inject(IMoodboardMediaRepository)
    private readonly moodboardMediaRepository: IMoodboardMediaRepository,
  ) {}

  async execute(query: GetMoodboardQuery): Promise<MoodboardObject | null> {
    this.logger.debug(`Getting moodboard by ID: ${query.id}`);

    const moodboard = await this.moodboardRepository.findById(query.id);

    if (!moodboard) {
      this.logger.debug(`Moodboard not found: ${query.id}`);
      return null;
    }

    const media = await this.moodboardMediaRepository.findByMoodboardId(
      moodboard.id,
    );

    return {
      ...moodboard,
      media,
    };
  }
}
