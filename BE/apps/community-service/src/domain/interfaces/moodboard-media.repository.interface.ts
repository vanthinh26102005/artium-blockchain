import { EntityManager } from 'typeorm';
import { MoodboardMedia } from '../entities/moodboard-media.entity';

export const IMoodboardMediaRepository = Symbol('IMoodboardMediaRepository');

export interface IMoodboardMediaRepository {
  createManyForMoodboard(
    moodboardId: string,
    items: Partial<MoodboardMedia>[],
    transactionManager?: EntityManager,
  ): Promise<MoodboardMedia[]>;

  findByMoodboardId(
    moodboardId: string,
    transactionManager?: EntityManager,
  ): Promise<MoodboardMedia[]>;
}
