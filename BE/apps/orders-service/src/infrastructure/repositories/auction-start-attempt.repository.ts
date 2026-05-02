import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsOrder, Repository } from 'typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';
import { AuctionStartAttempt } from '../../domain/entities';
import { IAuctionStartAttemptRepository } from '../../domain/interfaces';

@Injectable()
export class AuctionStartAttemptRepository implements IAuctionStartAttemptRepository {
  constructor(
    @InjectRepository(AuctionStartAttempt)
    private readonly ormRepository: Repository<AuctionStartAttempt>,
  ) {}

  private getRepo(
    transactionManager?: EntityManager,
  ): Repository<AuctionStartAttempt> {
    return transactionManager
      ? transactionManager.getRepository(AuctionStartAttempt)
      : this.ormRepository;
  }

  async create(
    data: Omit<AuctionStartAttempt, 'id' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt> {
    const repo = this.getRepo(transactionManager);
    const entity = repo.create(data);
    return repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<AuctionStartAttempt>,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update({ id }, data);
    return this.findById(id, transactionManager);
  }

  async delete(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async findById(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<AuctionStartAttempt>,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt | null> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options;
    return repo.findOne({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<AuctionStartAttempt>,
    });
  }

  async find(
    options?: FindManyOptions<AuctionStartAttempt>,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt[]> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options || {};
    return repo.find({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<AuctionStartAttempt>,
    });
  }

  async count(
    where?: WhereOperator<AuctionStartAttempt>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    return repo.count({ where: mapToTypeOrmWhere(where) });
  }

  async exists(
    where: WhereOperator<AuctionStartAttempt>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(where, transactionManager);
    return count > 0;
  }

  async createMany(
    data: Omit<AuctionStartAttempt, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt[]> {
    const repo = this.getRepo(transactionManager);
    const entities = repo.create(data);
    return repo.save(entities);
  }

  async updateMany(
    where: WhereOperator<AuctionStartAttempt>,
    data: Partial<AuctionStartAttempt>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.update(mapToTypeOrmWhere(where), data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<AuctionStartAttempt>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete(mapToTypeOrmWhere(where));
    return result.affected ?? 0;
  }

  async findLatestBySellerAndArtwork(
    sellerId: string,
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt | null> {
    return this.findOne(
      {
        where: { sellerId, artworkId },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findByOrderId(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt | null> {
    return this.findOne({ where: { orderId } }, transactionManager);
  }

  async findByTxHash(
    txHash: string,
    transactionManager?: EntityManager,
  ): Promise<AuctionStartAttempt | null> {
    return this.findOne({ where: { txHash } }, transactionManager);
  }
}
