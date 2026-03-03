import { FindManyOptions, IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Tag } from '../entities/tags.entity';

export const ITagRepository = Symbol('ITagRepository');

export interface ITagRepository extends IRepository<Tag, string> {
  findByName(
    name: string,
    transactionManager?: EntityManager,
  ): Promise<Tag | null>;

  findOrCreateMany(
    sellerId: string,
    tagNames: string[],
    transactionManager?: EntityManager,
  ): Promise<Tag[]>;

  findAvailableForSeller(
    sellerId: string,
    options?: FindManyOptions<Tag>,
    transactionManager?: EntityManager,
  ): Promise<Tag[]>;

  findSystemTags(
    options?: FindManyOptions<Tag>,
    transactionManager?: EntityManager,
  ): Promise<Tag[]>;

  searchForSeller(
    sellerId: string,
    query: string,
    limit?: number,
    transactionManager?: EntityManager,
  ): Promise<Tag[]>;

  findManyByNames(
    names: string[],
    transactionManager?: EntityManager,
  ): Promise<Tag[]>;
}
