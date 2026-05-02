import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IMoodboardMediaRepository, MoodboardMedia } from '../../domain';

@Injectable()
export class MoodboardMediaRepository implements IMoodboardMediaRepository {
  constructor(
    @InjectRepository(MoodboardMedia)
    private readonly ormRepository: Repository<MoodboardMedia>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<MoodboardMedia> {
    return manager ? manager.getRepository(MoodboardMedia) : this.ormRepository;
  }

  async createManyForMoodboard(
    moodboardId: string,
    items: Partial<MoodboardMedia>[],
    transactionManager?: EntityManager,
  ): Promise<MoodboardMedia[]> {
    const repo = this.getRepo(transactionManager);
    const entities = items.map((item) =>
      repo.create({
        ...item,
        moodboardId,
      }),
    );

    return repo.save(entities);
  }

  async findByMoodboardId(
    moodboardId: string,
    transactionManager?: EntityManager,
  ): Promise<MoodboardMedia[]> {
    return this.getRepo(transactionManager).find({
      where: { moodboardId },
      order: { displayOrder: 'ASC' },
    });
  }
}
