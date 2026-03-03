import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  EntityManager,
  LessThanOrEqual,
  FindOptionsOrder,
} from 'typeorm';
import { Payout } from '../../domain/entities';
import { IPayoutRepository } from '../../domain/interfaces';
import {
  PayoutStatus,
  PayoutProvider,
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';

@Injectable()
export class PayoutRepository implements IPayoutRepository {
  constructor(
    @InjectRepository(Payout)
    private readonly ormRepository: Repository<Payout>,
  ) {}

  private getRepo(transactionManager?: EntityManager): Repository<Payout> {
    return transactionManager
      ? transactionManager.getRepository(Payout)
      : this.ormRepository;
  }

  async create(
    data: Omit<Payout, 'payoutId' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<Payout> {
    const repo = this.getRepo(transactionManager);
    const payout = repo.create(data);
    return repo.save(payout);
  }

  async update(
    payoutId: string,
    data: Partial<Payout>,
    transactionManager?: EntityManager,
  ): Promise<Payout | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update({ id: payoutId }, data);
    return this.findById(payoutId, transactionManager);
  }

  async delete(
    payoutId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete({ id: payoutId });
    return (result.affected ?? 0) > 0;
  }

  async findById(
    payoutId: string,
    transactionManager?: EntityManager,
  ): Promise<Payout | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({
      where: { id: payoutId },
    });
  }

  async findOne(
    options: FindOneOptions<Payout>,
    transactionManager?: EntityManager,
  ): Promise<Payout | null> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options;
    return repo.findOne({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Payout>,
    });
  }

  async find(
    options?: FindManyOptions<Payout>,
    transactionManager?: EntityManager,
  ): Promise<Payout[]> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options || {};
    return repo.find({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Payout>,
    });
  }

  async count(
    where?: WhereOperator<Payout>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    return repo.count({ where: mapToTypeOrmWhere(where) });
  }

  async exists(
    where: WhereOperator<Payout>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(where, transactionManager);
    return count > 0;
  }

  async createMany(
    data: Omit<Payout, 'payoutId'>[],
    transactionManager?: EntityManager,
  ): Promise<Payout[]> {
    const repo = this.getRepo(transactionManager);
    const payouts = repo.create(data);
    return repo.save(payouts);
  }

  async updateMany(
    where: WhereOperator<Payout>,
    data: Partial<Payout>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.update(mapToTypeOrmWhere(where), data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<Payout>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete(mapToTypeOrmWhere(where));
    return result.affected ?? 0;
  }

  // Specialized methods

  async findBySellerId(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<Payout[]> {
    return this.find(
      {
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findByStatus(
    status: PayoutStatus,
    transactionManager?: EntityManager,
  ): Promise<Payout[]> {
    return this.find(
      {
        where: { status },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findByProvider(
    provider: PayoutProvider,
    transactionManager?: EntityManager,
  ): Promise<Payout[]> {
    return this.find(
      {
        where: { provider },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async markAsProcessed(
    payoutId: string,
    transactionManager?: EntityManager,
  ): Promise<Payout | null> {
    return this.update(
      payoutId,
      {
        status: PayoutStatus.PROCESSING,
        processedAt: new Date(),
      },
      transactionManager,
    );
  }

  async markAsCompleted(
    payoutId: string,
    arrivalDate?: Date,
    transactionManager?: EntityManager,
  ): Promise<Payout | null> {
    return this.update(
      payoutId,
      {
        status: PayoutStatus.PAID,
        paidAt: new Date(),
        arrivalDate: arrivalDate || new Date(),
      },
      transactionManager,
    );
  }

  async markAsFailed(
    payoutId: string,
    failureReason: string,
    failureCode?: string,
    transactionManager?: EntityManager,
  ): Promise<Payout | null> {
    return this.update(
      payoutId,
      {
        status: PayoutStatus.FAILED,
        failureReason,
        failureCode,
      },
      transactionManager,
    );
  }

  async getTotalPayoutAmountBySeller(
    sellerId: string,
    status?: PayoutStatus,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const whereCondition: any = { sellerId };

    if (status) {
      whereCondition.status = status;
    }

    const result = await repo
      .createQueryBuilder('payout')
      .select('SUM(payout.amount)', 'total')
      .where(whereCondition)
      .getRawOne();

    return Number(result?.total || 0);
  }

  async findScheduledPayouts(
    transactionManager?: EntityManager,
  ): Promise<Payout[]> {
    const repo = this.getRepo(transactionManager);
    const now = new Date();

    return repo.find({
      where: {
        status: PayoutStatus.PENDING,
        scheduledAt: LessThanOrEqual(now),
      },
      order: {
        scheduledAt: 'asc',
      },
    });
  }
}
