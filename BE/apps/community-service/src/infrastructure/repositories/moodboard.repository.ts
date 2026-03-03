import {
  FindManyOptions,
  FindOneOptions,
  mapToTypeOrmWhere,
  WhereOperator,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsOrder,
  Repository,
  FindManyOptions as TypeOrmFindManyOptions,
  FindOneOptions as TypeOrmFindOneOptions,
} from 'typeorm';
import {
  Moodboard,
  MoodboardArtwork,
  IMoodboardRepository,
  IMoodboardArtworkRepository,
  CreateMoodboardInput,
  UpdateMoodboardInput,
} from '../../domain';

@Injectable()
export class MoodboardRepository implements IMoodboardRepository {
  private readonly logger = new Logger(MoodboardRepository.name);

  constructor(
    @InjectRepository(Moodboard)
    private readonly ormRepository: Repository<Moodboard>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<Moodboard> {
    return manager ? manager.getRepository(Moodboard) : this.ormRepository;
  }

  // --- IRepository Implementation ---

  async create(
    data: CreateMoodboardInput | Omit<Moodboard, 'id' | 'createdAt'>,
    manager?: EntityManager,
  ): Promise<Moodboard> {
    const repo = this.getRepo(manager);
    return repo.save(repo.create(data as unknown as Partial<Moodboard>));
  }

  async update(
    id: string,
    data: UpdateMoodboardInput | Partial<Moodboard>,
    manager?: EntityManager,
  ): Promise<Moodboard | null> {
    const repo = this.getRepo(manager);
    const entity = await repo.findOneBy({ id });

    if (!entity) return null;

    repo.merge(entity, data as Partial<Moodboard>);
    return repo.save(entity);
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const repo = this.getRepo(manager);
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: string,
    manager?: EntityManager,
  ): Promise<Moodboard | null> {
    return this.getRepo(manager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<Moodboard>,
    manager?: EntityManager,
  ): Promise<Moodboard | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<Moodboard> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Moodboard>,
    };
    return this.getRepo(manager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<Moodboard> = {},
    manager?: EntityManager,
  ): Promise<Moodboard[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<Moodboard> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Moodboard>,
    };
    return this.getRepo(manager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<Moodboard>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<Moodboard>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).exist({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<Moodboard, 'id'>[],
    manager?: EntityManager,
  ): Promise<Moodboard[]> {
    return this.getRepo(manager).save(data as Moodboard[]);
  }

  async updateMany(
    where: WhereOperator<Moodboard>,
    data: Partial<Moodboard>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).update(typeOrmWhere, data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<Moodboard>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  // --- Custom Methods ---

  async findByUserId(
    userId: string,
    options?: FindManyOptions<Moodboard>,
    manager?: EntityManager,
  ): Promise<Moodboard[]> {
    const where: WhereOperator<Moodboard> = { ...options?.where, userId };
    return this.find({ ...options, where }, manager);
  }

  async findPublicByUserId(
    userId: string,
    options?: FindManyOptions<Moodboard>,
    manager?: EntityManager,
  ): Promise<Moodboard[]> {
    const where: WhereOperator<Moodboard> = {
      ...options?.where,
      userId,
      isPrivate: false,
    };
    return this.find({ ...options, where }, manager);
  }

  async findCollaborative(
    userId: string,
    manager?: EntityManager,
  ): Promise<Moodboard[]> {
    const repo = this.getRepo(manager);
    // Query moodboards where userId is in collaboratorIds
    const queryBuilder = repo.createQueryBuilder('moodboard');
    queryBuilder.where(`moodboard.collaborator_ids @> :userId`, {
      userId: JSON.stringify([userId]),
    });
    return queryBuilder.getMany();
  }

  async incrementArtworkCount(
    id: string,
    increment: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.increment({ id }, 'artworkCount', increment);
  }

  async incrementLikeCount(
    id: string,
    increment: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.increment({ id }, 'likeCount', increment);
  }

  async incrementViewCount(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.increment({ id }, 'viewCount', 1);
  }

  async incrementShareCount(
    id: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.increment({ id }, 'shareCount', 1);
  }

  async reorder(
    userId: string,
    moodboardIds: string[],
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    for (let i = 0; i < moodboardIds.length; i++) {
      // Ensure we only update moodboards belonging to the user
      await repo.update({ id: moodboardIds[i], userId }, { displayOrder: i });
    }
  }
}

@Injectable()
export class MoodboardArtworkRepository implements IMoodboardArtworkRepository {
  private readonly logger = new Logger(MoodboardArtworkRepository.name);

  constructor(
    @InjectRepository(MoodboardArtwork)
    private readonly ormRepository: Repository<MoodboardArtwork>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<MoodboardArtwork> {
    return manager
      ? manager.getRepository(MoodboardArtwork)
      : this.ormRepository;
  }

  // --- IRepository Implementation (Composite Key Support) ---

  async create(
    data: Omit<MoodboardArtwork, 'createdAt'>,
    manager?: EntityManager,
  ): Promise<MoodboardArtwork> {
    const repo = this.getRepo(manager);
    return repo.save(repo.create(data as unknown as Partial<MoodboardArtwork>));
  }

  async update(
    id: any,
    data: Partial<MoodboardArtwork>,
    manager?: EntityManager,
  ): Promise<MoodboardArtwork | null> {
    const repo = this.getRepo(manager);
    const criteria = typeof id === 'object' ? id : { id }; // id maps to moodboard_id

    // For update to work uniquely on composite key, we usually need both keys.
    // If id is string, it's just moodboard_id, might update many rows?
    // Repository.update(criteria, data) updates all matching.
    // IRepository.update expects to update ONE item or by ID.
    // We'll implement strict findOne then save.

    const entity = await repo.findOneBy(criteria);
    if (!entity) return null;

    repo.merge(entity, data);
    return repo.save(entity);
  }

  async delete(id: any, manager?: EntityManager): Promise<boolean> {
    const repo = this.getRepo(manager);
    const criteria = typeof id === 'object' ? id : { id };
    const result = await repo.delete(criteria);
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: any,
    manager?: EntityManager,
  ): Promise<MoodboardArtwork | null> {
    const repo = this.getRepo(manager);
    const criteria = typeof id === 'object' ? id : { id };
    return repo.findOneBy(criteria);
  }

  async findOne(
    options: FindOneOptions<MoodboardArtwork>,
    manager?: EntityManager,
  ): Promise<MoodboardArtwork | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<MoodboardArtwork> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<MoodboardArtwork>,
    };
    return this.getRepo(manager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<MoodboardArtwork> = {},
    manager?: EntityManager,
  ): Promise<MoodboardArtwork[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<MoodboardArtwork> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<MoodboardArtwork>,
    };
    return this.getRepo(manager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<MoodboardArtwork>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<MoodboardArtwork>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).exist({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<MoodboardArtwork, 'id'>[], // id is moodboard_id, required?
    manager?: EntityManager,
  ): Promise<MoodboardArtwork[]> {
    // Note: data typing here is loose because 'id' is required for MoodboardArtwork but Omit removes it.
    // In composite key entities, 'id' might refer to one part of key.
    return this.getRepo(manager).save(data as unknown as MoodboardArtwork[]);
  }

  async updateMany(
    where: WhereOperator<MoodboardArtwork>,
    data: Partial<MoodboardArtwork>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).update(typeOrmWhere, data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<MoodboardArtwork>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  // --- Custom Methods ---

  async addArtwork(
    moodboardId: string,
    artworkId: string,
    data: Partial<MoodboardArtwork>,
    manager?: EntityManager,
  ): Promise<MoodboardArtwork> {
    const repo = this.getRepo(manager);
    const artwork = repo.create({
      ...data,
      id: moodboardId, // composite key part 1
      artworkId, // composite key part 2
    });
    return repo.save(artwork);
  }

  async removeArtwork(
    moodboardId: string,
    artworkId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.delete({ id: moodboardId, artworkId }, manager);
  }

  async findByMoodboardId(
    moodboardId: string,
    manager?: EntityManager,
  ): Promise<MoodboardArtwork[]> {
    return this.find(
      {
        where: { id: moodboardId },
        orderBy: { displayOrder: 'asc' },
      },
      manager,
    );
  }

  async findByArtworkId(
    artworkId: string,
    manager?: EntityManager,
  ): Promise<MoodboardArtwork[]> {
    return this.find({ where: { artworkId } }, manager);
  }

  async updateArtwork(
    moodboardId: string,
    artworkId: string,
    data: Partial<MoodboardArtwork>,
    manager?: EntityManager,
  ): Promise<MoodboardArtwork | null> {
    return this.update({ id: moodboardId, artworkId }, data, manager);
  }

  async reorderArtworks(
    moodboardId: string,
    artworkIds: string[],
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    for (let i = 0; i < artworkIds.length; i++) {
      await repo.update(
        { id: moodboardId, artworkId: artworkIds[i] },
        { displayOrder: i },
      );
    }
  }

  async isArtworkInMoodboard(
    moodboardId: string,
    artworkId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.exists({ id: moodboardId, artworkId }, manager);
  }
}
