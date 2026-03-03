import { FindManyOptions, IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import {
  CreateCommentInput,
  UpdateCommentInput,
  CommentableType,
} from '../dtos';

export const ICommentRepository = Symbol('ICommentRepository');

export interface ICommentRepository extends IRepository<Comment, string> {
  create(
    data: CreateCommentInput,
    transactionManager?: EntityManager,
  ): Promise<Comment>;

  update(
    id: string,
    data: UpdateCommentInput,
    transactionManager?: EntityManager,
  ): Promise<Comment | null>;

  findByEntity(
    commentableType: CommentableType,
    commentableId: string,
    options?: FindManyOptions<Comment>,
    transactionManager?: EntityManager,
  ): Promise<Comment[]>;

  findReplies(
    parentCommentId: string,
    options?: FindManyOptions<Comment>,
    transactionManager?: EntityManager,
  ): Promise<Comment[]>;

  findByUserId(
    userId: string,
    options?: FindManyOptions<Comment>,
    transactionManager?: EntityManager,
  ): Promise<Comment[]>;

  softDelete(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Comment | null>;

  flag(id: string, transactionManager?: EntityManager): Promise<Comment | null>;

  unflag(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Comment | null>;

  incrementLikeCount(
    id: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void>;

  incrementReplyCount(
    id: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void>;

  countByEntity(
    commentableType: CommentableType,
    commentableId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;
}
