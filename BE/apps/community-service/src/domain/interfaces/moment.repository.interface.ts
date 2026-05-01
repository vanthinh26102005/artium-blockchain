import { FindManyOptions, IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Moment } from '../entities/moments.entity';
import { CreateMomentInput, UpdateMomentInput } from '../dtos';

export const IMomentRepository = Symbol('IMomentRepository');

export interface IMomentRepository extends IRepository<Moment, string> {
  create(
    data:
      | Omit<CreateMomentInput, 'taggedArtworkIds'>
      | Partial<Moment>,
    transactionManager?: EntityManager,
  ): Promise<Moment>;

  update(
    id: string,
    data: UpdateMomentInput,
    transactionManager?: EntityManager,
  ): Promise<Moment | null>;

  findByUserId(
    userId: string,
    options?: FindManyOptions<Moment>,
    transactionManager?: EntityManager,
  ): Promise<Moment[]>;

  findActive(
    options?: FindManyOptions<Moment>,
    transactionManager?: EntityManager,
  ): Promise<Moment[]>;

  findExpired(transactionManager?: EntityManager): Promise<Moment[]>;

  incrementViewCount(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<void>;

  incrementLikeCount(
    id: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void>;

  incrementCommentCount(
    id: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void>;

  archive(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Moment | null>;

  unarchive(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<Moment | null>;

  pin(id: string, transactionManager?: EntityManager): Promise<Moment | null>;

  unpin(id: string, transactionManager?: EntityManager): Promise<Moment | null>;
}
