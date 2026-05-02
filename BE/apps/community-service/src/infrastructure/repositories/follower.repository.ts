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
import { Follower, IFollowerRepository, FollowUserInput } from '../../domain';

@Injectable()
export class FollowerRepository implements IFollowerRepository {
  private readonly logger = new Logger(FollowerRepository.name);

  constructor(
    @InjectRepository(Follower)
    private readonly ormRepository: Repository<Follower>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<Follower> {
    return manager ? manager.getRepository(Follower) : this.ormRepository;
  }

  // --- IRepository Implementation ---

  async create(
    data: Omit<Follower, 'id' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<Follower> {
    const repo = this.getRepo(transactionManager);
    return repo.save(data as unknown as Follower);
  }

  async update(
    id: any, // Composite key or partial
    data: Partial<Follower>,
    transactionManager?: EntityManager,
  ): Promise<Follower | null> {
    const repo = this.getRepo(transactionManager);
    // Handle composite key if id is object, else assume standard id (followingUserId)
    const criteria = typeof id === 'object' ? id : { id };

    const entity = await repo.findOneBy(criteria);
    if (!entity) return null;

    repo.merge(entity, data);
    return repo.save(entity);
  }

  async delete(id: any, transactionManager?: EntityManager): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const criteria = typeof id === 'object' ? id : { id };
    const result = await repo.delete(criteria);
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: any,
    transactionManager?: EntityManager,
  ): Promise<Follower | null> {
    const repo = this.getRepo(transactionManager);
    const criteria = typeof id === 'object' ? id : { id };
    return repo.findOneBy(criteria);
  }

  async findOne(
    options: FindOneOptions<Follower>,
    transactionManager?: EntityManager,
  ): Promise<Follower | null> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindOneOptions<Follower> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Follower>,
    };
    return this.getRepo(transactionManager).findOne(typeOrmOptions);
  }

  async find(
    options: FindManyOptions<Follower> = {},
    transactionManager?: EntityManager,
  ): Promise<Follower[]> {
    const { where, orderBy, ...rest } = options;
    const typeOrmOptions: TypeOrmFindManyOptions<Follower> = {
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Follower>,
    };
    return this.getRepo(transactionManager).find(typeOrmOptions);
  }

  async count(
    where?: WhereOperator<Follower>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).count({ where: typeOrmWhere });
  }

  async exists(
    where: WhereOperator<Follower>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    return this.getRepo(transactionManager).exist({ where: typeOrmWhere });
  }

  async createMany(
    data: Omit<Follower, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<Follower[]> {
    return this.getRepo(transactionManager).save(data as unknown as Follower[]);
  }

  async updateMany(
    where: WhereOperator<Follower>,
    data: Partial<Follower>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).update(
      typeOrmWhere,
      data,
    );
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<Follower>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const typeOrmWhere = mapToTypeOrmWhere(where);
    const result = await this.getRepo(transactionManager).delete(typeOrmWhere);
    return result.affected ?? 0;
  }

  // --- Custom Methods ---

  async follow(
    data: FollowUserInput,
    manager?: EntityManager,
  ): Promise<Follower> {
    const repo = this.getRepo(manager);
    const follower = repo.create({
      followingUserId: data.followingUserId,
      followedUserId: data.followedUserId,
      notifyOnPosts: data.notifyOnPosts ?? true,
      notifyOnEvents: data.notifyOnEvents ?? true,
      followSource: data.followSource,
      isMutual: false,
      isAutoFollow: false,
      engagementScore: 0,
    });
    return repo.save(follower);
  }

  async unfollow(
    followingUserId: string,
    followedUserId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.delete({ followingUserId, followedUserId }, manager);
  }

  async findFollowers(
    userId: string,
    skip?: number,
    take?: number,
    manager?: EntityManager,
  ): Promise<Follower[]> {
    return this.find(
      {
        where: { followedUserId: userId },
        skip,
        take: take ?? 20,
        orderBy: { createdAt: 'desc' },
      },
      manager,
    );
  }

  async findFollowing(
    userId: string,
    skip?: number,
    take?: number,
    manager?: EntityManager,
  ): Promise<Follower[]> {
    return this.find(
      {
        where: { followingUserId: userId }, // id is following_user_id
        skip,
        take: take ?? 20,
        orderBy: { createdAt: 'desc' },
      },
      manager,
    );
  }

  async countFollowers(
    userId: string,
    manager?: EntityManager,
  ): Promise<number> {
    return this.count({ followedUserId: userId }, manager);
  }

  async countFollowing(
    userId: string,
    manager?: EntityManager,
  ): Promise<number> {
    return this.count({ followingUserId: userId }, manager);
  }

  async isFollowing(
    followingUserId: string,
    followedUserId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.exists(
      { followingUserId: followingUserId, followedUserId },
      manager,
    );
  }

  async checkMutualFollow(
    userId1: string,
    userId2: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const follows1to2 = await this.isFollowing(userId1, userId2, manager);
    const follows2to1 = await this.isFollowing(userId2, userId1, manager);
    return follows1to2 && follows2to1;
  }

  async updateMutualStatus(
    followingUserId: string,
    followedUserId: string,
    isMutual: boolean,
    manager?: EntityManager,
  ): Promise<void> {
    await this.update(
      { followingUserId, followedUserId },
      { isMutual },
      manager,
    );
  }

  async updateNotificationPreferences(
    followingUserId: string,
    followedUserId: string,
    preferences: { notifyOnPosts?: boolean; notifyOnEvents?: boolean },
    manager?: EntityManager,
  ): Promise<Follower | null> {
    // We can't use helper methods easily here because we need to update selective fields
    // But update supports partial
    return this.update(
      { followingUserId, followedUserId },
      preferences,
      manager,
    );
  }

  async updateEngagementScore(
    followingUserId: string,
    followedUserId: string,
    score: number,
    manager?: EntityManager,
  ): Promise<void> {
    await this.update(
      { followingUserId, followedUserId },
      { engagementScore: score },
      manager,
    );
  }

  async updateLastViewedAt(
    followingUserId: string,
    followedUserId: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.update(
      { followingUserId, followedUserId },
      { lastViewedAt: new Date() },
      manager,
    );
  }

  async getMutualFollowers(
    userId1: string,
    userId2: string,
    manager?: EntityManager,
  ): Promise<string[]> {
    const repo = this.getRepo(manager);

    const user1Following = await repo.find({
      where: { followingUserId: userId1 },
      select: ['followedUserId'],
    });
    const user2Following = await repo.find({
      where: { followingUserId: userId2 },
      select: ['followedUserId'],
    });

    const user1FollowingIds = user1Following.map((f) => f.followedUserId);
    const user2FollowingIds = user2Following.map((f) => f.followedUserId);

    return user1FollowingIds.filter((id) => user2FollowingIds.includes(id));
  }
}
