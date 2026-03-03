import { FindManyOptions, IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { ActivityFeed } from '../entities/activity-feed.entity';
import { ActivityType } from '../dtos';

export const IActivityFeedRepository = Symbol('IActivityFeedRepository');

export interface CreateActivityInput {
  userId: string;
  activityType: ActivityType;
  entityType: string | null;
  entityId: string | null;
  targetUserId?: string | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
  isPublic?: boolean;
}

export interface IActivityFeedRepository extends IRepository<
  ActivityFeed,
  string
> {
  create(
    data: CreateActivityInput,
    transactionManager?: EntityManager,
  ): Promise<ActivityFeed>;

  findByUserId(
    userId: string,
    options?: FindManyOptions<ActivityFeed>,
    transactionManager?: EntityManager,
  ): Promise<ActivityFeed[]>;

  findFeedForUser(
    userId: string,
    followedUserIds: string[],
    skip?: number,
    take?: number,
    transactionManager?: EntityManager,
  ): Promise<ActivityFeed[]>;

  findByActivityType(
    activityType: ActivityType,
    options?: FindManyOptions<ActivityFeed>,
    transactionManager?: EntityManager,
  ): Promise<ActivityFeed[]>;

  findByEntity(
    entityType: string,
    entityId: string,
    transactionManager?: EntityManager,
  ): Promise<ActivityFeed[]>;

  incrementViewCount(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<void>;

  incrementInteractionCount(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<void>;

  deleteByEntity(
    entityType: string,
    entityId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;

  deleteByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;
}
