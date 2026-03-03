import { IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Like } from '../entities/like.entity';
import { CreateLikeInput, LikeableType } from '../dtos';

export const ILikeRepository = Symbol('ILikeRepository');

export interface ILikeRepository extends IRepository<Like, string> {
  create(
    data: CreateLikeInput,
    transactionManager?: EntityManager,
  ): Promise<Like>;

  delete(userId: string, transactionManager?: EntityManager): Promise<boolean>;

  findByEntity(
    likeableType: LikeableType,
    likeableId: string,
    skip?: number,
    take?: number,
    transactionManager?: EntityManager,
  ): Promise<Like[]>;

  findByUserId(
    userId: string,
    likeableType?: LikeableType,
    skip?: number,
    take?: number,
    transactionManager?: EntityManager,
  ): Promise<Like[]>;

  isLiked(
    userId: string,
    likeableType: LikeableType,
    likeableId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean>;

  countByEntity(
    likeableType: LikeableType,
    likeableId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;

  findLikedEntityIds(
    userId: string,
    likeableType: LikeableType,
    entityIds: string[],
    transactionManager?: EntityManager,
  ): Promise<string[]>;
}
