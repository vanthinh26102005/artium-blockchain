import { EntityManager } from 'typeorm';
import { ArtworkLike } from '../entities/artwork-like.entity';

export const IArtworkLikeRepository = Symbol('IArtworkLikeRepository');

export interface IArtworkLikeRepository {
  findByUserAndArtwork(
    userId: string,
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkLike | null>;

  createIfNotExists(
    data: Pick<ArtworkLike, 'userId' | 'artworkId' | 'sellerId'>,
    transactionManager?: EntityManager,
  ): Promise<ArtworkLike | null>;

  delete(id: string, transactionManager?: EntityManager): Promise<boolean>;
}
