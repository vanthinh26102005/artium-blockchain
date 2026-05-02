import { CommunityMediaStatus, CommunityMediaUploadContext } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { CommunityMedia, ICommunityMediaRepository } from '../../domain';

@Injectable()
export class CommunityMediaRepository implements ICommunityMediaRepository {
  constructor(
    @InjectRepository(CommunityMedia)
    private readonly ormRepository: Repository<CommunityMedia>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<CommunityMedia> {
    return manager ? manager.getRepository(CommunityMedia) : this.ormRepository;
  }

  async create(
    data: Partial<CommunityMedia>,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia> {
    const repo = this.getRepo(transactionManager);
    return repo.save(repo.create(data));
  }

  async findById(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia | null> {
    return this.getRepo(transactionManager).findOneBy({ id });
  }

  async findByIds(
    ids: string[],
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.getRepo(transactionManager).find({
      where: { id: In(ids) },
    });
  }

  async findPendingByOwner(
    ownerId: string,
    uploadContext?: CommunityMediaUploadContext,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia[]> {
    return this.getRepo(transactionManager).find({
      where: {
        ownerId,
        status: CommunityMediaStatus.PENDING,
        ...(uploadContext ? { uploadContext } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markConsumed(
    id: string,
    consumedByType: string,
    consumedById: string,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia | null> {
    return this.update(
      id,
      {
        status: CommunityMediaStatus.CONSUMED,
        consumedByType,
        consumedById,
        consumedAt: new Date(),
      },
      transactionManager,
    );
  }

  async markRejected(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia | null> {
    return this.update(
      id,
      { status: CommunityMediaStatus.REJECTED },
      transactionManager,
    );
  }

  async update(
    id: string,
    data: Partial<CommunityMedia>,
    transactionManager?: EntityManager,
  ): Promise<CommunityMedia | null> {
    const repo = this.getRepo(transactionManager);
    const entity = await repo.findOneBy({ id });
    if (!entity) {
      return null;
    }

    repo.merge(entity, data);
    return repo.save(entity);
  }
}
