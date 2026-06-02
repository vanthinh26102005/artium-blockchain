import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WalletOwnership } from '../../domain/entities';
import { IWalletOwnershipRepository } from '../../domain/interfaces';

@Injectable()
export class WalletOwnershipRepository implements IWalletOwnershipRepository {
  constructor(
    @InjectRepository(WalletOwnership)
    private readonly ormRepository: Repository<WalletOwnership>,
  ) {}

  private getRepo(
    transactionManager?: EntityManager,
  ): Repository<WalletOwnership> {
    return transactionManager
      ? transactionManager.getRepository(WalletOwnership)
      : this.ormRepository;
  }

  async findByWalletAddress(
    walletAddress: string,
    transactionManager?: EntityManager,
  ): Promise<WalletOwnership | null> {
    return this.getRepo(transactionManager).findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
  }

  async findActiveUserIdByWalletAddress(
    walletAddress: string,
    transactionManager?: EntityManager,
  ): Promise<string | null> {
    const record = await this.findByWalletAddress(
      walletAddress,
      transactionManager,
    );

    return record?.userId && !record.unlinkedAt ? record.userId : null;
  }

  async recordLinked(
    data: {
      walletAddress: string;
      userId: string;
      occurredAt: Date;
    },
    transactionManager?: EntityManager,
  ): Promise<WalletOwnership> {
    const repo = this.getRepo(transactionManager);
    const walletAddress = data.walletAddress.toLowerCase();
    const existing = await this.findByWalletAddress(
      walletAddress,
      transactionManager,
    );

    if (existing && existing.lastEventAt > data.occurredAt) {
      return existing;
    }

    const entity = repo.create({
      walletAddress,
      userId: data.userId,
      linkedAt: data.occurredAt,
      unlinkedAt: null,
      lastEventAt: data.occurredAt,
    });

    return repo.save(entity);
  }

  async recordUnlinked(
    data: {
      walletAddress: string;
      userId: string;
      occurredAt: Date;
    },
    transactionManager?: EntityManager,
  ): Promise<WalletOwnership | null> {
    const repo = this.getRepo(transactionManager);
    const walletAddress = data.walletAddress.toLowerCase();
    const existing = await this.findByWalletAddress(
      walletAddress,
      transactionManager,
    );

    if (!existing) {
      return null;
    }

    if (existing.lastEventAt > data.occurredAt) {
      return existing;
    }

    if (existing.userId && existing.userId !== data.userId) {
      return existing;
    }

    existing.unlinkedAt = data.occurredAt;
    existing.lastEventAt = data.occurredAt;
    return repo.save(existing);
  }
}
