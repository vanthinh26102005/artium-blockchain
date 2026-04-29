import { SellerAuctionStartStatusObject } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ArtworkAuctionLifecycleSnapshot } from '../../domain/entities/artwork-auction-lifecycle.entity';
import { IArtworkAuctionLifecycleRepository } from '../../domain/interfaces/artwork-auction-lifecycle.repository.interface';

@Injectable()
export class ArtworkAuctionLifecycleRepository implements IArtworkAuctionLifecycleRepository {
  constructor(
    @InjectRepository(ArtworkAuctionLifecycleSnapshot)
    private readonly ormRepository: Repository<ArtworkAuctionLifecycleSnapshot>,
  ) {}

  private getRepo(
    transactionManager?: EntityManager,
  ): Repository<ArtworkAuctionLifecycleSnapshot> {
    return transactionManager
      ? transactionManager.getRepository(ArtworkAuctionLifecycleSnapshot)
      : this.ormRepository;
  }

  async upsertSnapshot(
    lifecycle: SellerAuctionStartStatusObject,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(transactionManager);
    const parsedUpdatedAt = new Date(lifecycle.updatedAt);
    const sourceUpdatedAt = Number.isNaN(parsedUpdatedAt.getTime())
      ? new Date()
      : parsedUpdatedAt;
    const existing = await repo.findOne({
      where: {
        sellerId: lifecycle.sellerId,
        artworkId: lifecycle.artworkId,
      },
    });

    if (existing && existing.sourceUpdatedAt > sourceUpdatedAt) {
      return;
    }

    await repo.upsert(
      repo.create({
        sellerId: lifecycle.sellerId,
        artworkId: lifecycle.artworkId,
        attemptId: lifecycle.attemptId,
        orderId: lifecycle.orderId,
        sourceUpdatedAt,
        lifecycle,
      }),
      ['sellerId', 'artworkId'],
    );
  }

  async findBySellerAndArtworkIds(
    sellerId: string,
    artworkIds: string[],
    transactionManager?: EntityManager,
  ): Promise<SellerAuctionStartStatusObject[]> {
    if (artworkIds.length === 0) {
      return [];
    }

    const snapshots = await this.getRepo(transactionManager).find({
      where: {
        sellerId,
        artworkId: In(artworkIds),
      },
    });

    return snapshots.map((snapshot) => snapshot.lifecycle);
  }

  async findBySellerAndArtworkId(
    sellerId: string,
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<SellerAuctionStartStatusObject | null> {
    const snapshot = await this.getRepo(transactionManager).findOne({
      where: {
        sellerId,
        artworkId,
      },
    });

    return snapshot?.lifecycle ?? null;
  }
}
