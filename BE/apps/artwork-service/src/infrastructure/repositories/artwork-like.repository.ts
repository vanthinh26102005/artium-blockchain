import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ArtworkLike, IArtworkLikeRepository } from '../../domain';

@Injectable()
export class ArtworkLikeRepository implements IArtworkLikeRepository {
  constructor(
    @InjectRepository(ArtworkLike)
    private readonly ormRepository: Repository<ArtworkLike>,
  ) {}

  private getRepo(transactionManager?: EntityManager): Repository<ArtworkLike> {
    return transactionManager
      ? transactionManager.getRepository(ArtworkLike)
      : this.ormRepository;
  }

  findByUserAndArtwork(
    userId: string,
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<ArtworkLike | null> {
    return this.getRepo(transactionManager).findOneBy({ userId, artworkId });
  }

  async createIfNotExists(
    data: Pick<ArtworkLike, 'userId' | 'artworkId' | 'sellerId'>,
    transactionManager?: EntityManager,
  ): Promise<ArtworkLike | null> {
    const repo = this.getRepo(transactionManager);
    try {
      return await repo.save(repo.create(data));
    } catch (error: any) {
      if (error?.code === '23505' || error?.code === 'ER_DUP_ENTRY') {
        return null;
      }

      throw error;
    }
  }

  async delete(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const result = await this.getRepo(transactionManager).delete(id);
    return (result.affected ?? 0) > 0;
  }
}
