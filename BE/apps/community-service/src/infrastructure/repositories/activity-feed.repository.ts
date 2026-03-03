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
  In,
} from 'typeorm';
import {
  ActivityFeed,
  IActivityFeedRepository,
  CreateActivityInput,
  ActivityType,
} from '../../domain';

@Injectable()
export class ActivityFeedRepository implements IActivityFeedRepository {
  private readonly logger = new Logger(ActivityFeedRepository.name);

  constructor(
    @InjectRepository(ActivityFeed)
    private readonly ormRepository: Repository<ActivityFeed>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<ActivityFeed> {
    return manager ? manager.getRepository(ActivityFeed) : this.ormRepository;
  }

  // --- IRepository Implementation ---

  async create(
    data: CreateActivityInput | Omit<ActivityFeed, 'id' | 'createdAt'>,
    manager?: EntityManager,
  ): Promise<ActivityFeed> {
    const repo = this.getRepo(manager);
    return repo.save(repo.create(data as unknown as Partial<ActivityFeed>));
  }

  async update(
    id: string,
    data: Partial<ActivityFeed>,
    manager?: EntityManager,
  ): Promise<ActivityFeed | null> {
    const repo = this.getRepo(manager);
    const entity = await repo.findOneBy({ id });
    if (!entity) return null;
    repo.merge(entity, data);
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
  ): Promise<ActivityFeed | null> {
    return this.getRepo(manager).findOneBy({ id });
  }

  async findOne(
    options: FindOneOptions<ActivityFeed>,
    manager?: EntityManager,
  ): Promise<ActivityFeed | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<ActivityFeed> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<ActivityFeed>,
    };
    return this.getRepo(manager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<ActivityFeed> = {},
    manager?: EntityManager,
  ): Promise<ActivityFeed[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<ActivityFeed> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<ActivityFeed>,
    };
    return this.getRepo(manager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<ActivityFeed>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<ActivityFeed>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(manager).exist({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<ActivityFeed, 'id'>[],
    manager?: EntityManager,
  ): Promise<ActivityFeed[]> {
    return this.getRepo(manager).save(data as ActivityFeed[]);
  }

  async updateMany(
    where: WhereOperator<ActivityFeed>,
    data: Partial<ActivityFeed>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).update(typeOrmWhere, data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<ActivityFeed>,
    manager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(manager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  // --- Custom Methods ---

  async findByUserId(
    userId: string,
    options?: FindManyOptions<ActivityFeed>,
    manager?: EntityManager,
  ): Promise<ActivityFeed[]> {
    return this.find(
      { ...options, where: { ...options?.where, userId } },
      manager,
    );
  }

  async findFeedForUser(
    userId: string,
    followedUserIds: string[],
    skip?: number,
    take?: number,
    manager?: EntityManager,
  ): Promise<ActivityFeed[]> {
    const repo = this.getRepo(manager);

    // User sees their own activity and activity of people they follow
    // AND public activities? Usually feed is friends + self.
    const userIds = [...followedUserIds, userId];

    return repo.find({
      where: { userId: In(userIds) },
      order: { createdAt: 'DESC' },
      skip,
      take: take ?? 20,
    });
  }

  async findByActivityType(
    activityType: ActivityType,
    options?: FindManyOptions<ActivityFeed>,
    manager?: EntityManager,
  ): Promise<ActivityFeed[]> {
    return this.find(
      { ...options, where: { ...options?.where, activityType } },
      manager,
    );
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    manager?: EntityManager,
  ): Promise<ActivityFeed[]> {
    return this.find({ where: { entityType, entityId } }, manager);
  }

  async incrementViewCount(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.increment({ id }, 'viewCount', 1);
  }

  async incrementInteractionCount(
    id: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.increment({ id }, 'interactionCount', 1);
  }

  async deleteByEntity(
    entityType: string,
    entityId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(manager);
    const result = await repo.delete({ entityType, entityId });
    return result.affected ?? 0;
  }

  async deleteByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(manager);
    const result = await repo.delete({ userId });
    return result.affected ?? 0;
  }
}
