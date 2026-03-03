import { IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Follower } from '../entities/followers.entity';
import { FollowUserInput } from '../dtos';

export const IFollowerRepository = Symbol('IFollowerRepository');

export interface IFollowerRepository extends IRepository<Follower, any> {
  follow(
    data: FollowUserInput,
    transactionManager?: EntityManager,
  ): Promise<Follower>;

  unfollow(
    followingUserId: string,
    followedUserId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean>;

  findFollowers(
    userId: string,
    skip?: number,
    take?: number,
    transactionManager?: EntityManager,
  ): Promise<Follower[]>;

  findFollowing(
    userId: string,
    skip?: number,
    take?: number,
    transactionManager?: EntityManager,
  ): Promise<Follower[]>;

  countFollowers(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;

  countFollowing(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;

  isFollowing(
    followingUserId: string,
    followedUserId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean>;

  checkMutualFollow(
    userId1: string,
    userId2: string,
    transactionManager?: EntityManager,
  ): Promise<boolean>;

  updateMutualStatus(
    followingUserId: string,
    followedUserId: string,
    isMutual: boolean,
    transactionManager?: EntityManager,
  ): Promise<void>;

  updateNotificationPreferences(
    followingUserId: string,
    followedUserId: string,
    preferences: { notifyOnPosts?: boolean; notifyOnEvents?: boolean },
    transactionManager?: EntityManager,
  ): Promise<Follower | null>;

  updateEngagementScore(
    followingUserId: string,
    followedUserId: string,
    score: number,
    transactionManager?: EntityManager,
  ): Promise<void>;

  updateLastViewedAt(
    followingUserId: string,
    followedUserId: string,
    transactionManager?: EntityManager,
  ): Promise<void>;

  getMutualFollowers(
    userId1: string,
    userId2: string,
    transactionManager?: EntityManager,
  ): Promise<string[]>;
}
