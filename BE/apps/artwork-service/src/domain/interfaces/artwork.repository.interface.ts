import { ArtworkStatus, FindManyOptions, IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { Artwork } from '../entities/artworks.entity';

export const IArtworkRepository = Symbol('IArtworkRepository');

export interface IArtworkRepository extends IRepository<Artwork, string> {
  findAndCount(
    options?: FindManyOptions<Artwork> & {
      searchQuery?: string;
      minPrice?: number;
      maxPrice?: number;
      hasOnChainAuctionId?: boolean;
    },
    transactionManager?: EntityManager,
  ): Promise<[Artwork[], number]>;

  findManyBySellerId(
    sellerId: string,
    options?: FindManyOptions<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<Artwork[]>;

  findManyByFolderId(
    folderId: string,
    options?: FindManyOptions<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<Artwork[]>;

  updateStatus(
    artworkIds: string[],
    status: ArtworkStatus,
    transactionManager?: EntityManager,
  ): Promise<number>;

  markAsSold(
    artworkId: string,
    quantitySold?: number,
    transactionManager?: EntityManager,
  ): Promise<Artwork | null>;

  search(
    sellerId: string,
    query: string,
    options?: FindManyOptions<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<Artwork[]>;

  findManyByTags(
    sellerId: string,
    tagIds: string[],
    options?: { match?: 'all' | 'any' },
    findOptions?: FindManyOptions<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<Artwork[]>;

  findByPriceRange(
    sellerId: string,
    minPrice: number,
    maxPrice: number,
    currency: string,
    options?: FindManyOptions<Artwork>,
    transactionManager?: EntityManager,
  ): Promise<Artwork[]>;

  countByStatus(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<Record<ArtworkStatus, number>>;

  incrementLikeCount(
    artworkId: string,
    increment: number,
    transactionManager?: EntityManager,
  ): Promise<void>;
}
