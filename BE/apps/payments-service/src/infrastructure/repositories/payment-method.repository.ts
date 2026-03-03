import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsOrder } from 'typeorm';
import { PaymentMethod } from '../../domain/entities';
import { IPaymentMethodRepository } from '../../domain/interfaces';
import {
  PaymentProvider,
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';

@Injectable()
export class PaymentMethodRepository implements IPaymentMethodRepository {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly ormRepository: Repository<PaymentMethod>,
  ) {}

  private getRepo(
    transactionManager?: EntityManager,
  ): Repository<PaymentMethod> {
    return transactionManager
      ? transactionManager.getRepository(PaymentMethod)
      : this.ormRepository;
  }

  async create(
    data: Omit<PaymentMethod, 'paymentMethodId' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod> {
    const repo = this.getRepo(transactionManager);
    const paymentMethod = repo.create(data);
    return repo.save(paymentMethod);
  }

  async update(
    paymentMethodId: string,
    data: Partial<PaymentMethod>,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update({ id: paymentMethodId }, data);
    return this.findById(paymentMethodId, transactionManager);
  }

  async delete(
    paymentMethodId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete({ id: paymentMethodId });
    return (result.affected ?? 0) > 0;
  }

  async findById(
    paymentMethodId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({
      where: { id: paymentMethodId },
    });
  }

  async findOne(
    options: FindOneOptions<PaymentMethod>,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options;
    return repo.findOne({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<PaymentMethod>,
    });
  }

  async find(
    options?: FindManyOptions<PaymentMethod>,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod[]> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options || {};
    return repo.find({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<PaymentMethod>,
    });
  }

  async count(
    where?: WhereOperator<PaymentMethod>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    return repo.count({ where: mapToTypeOrmWhere(where) });
  }

  async exists(
    where: WhereOperator<PaymentMethod>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(where, transactionManager);
    return count > 0;
  }

  async createMany(
    data: Omit<PaymentMethod, 'paymentMethodId'>[],
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod[]> {
    const repo = this.getRepo(transactionManager);
    const paymentMethods = repo.create(data);
    return repo.save(paymentMethods);
  }

  async updateMany(
    where: WhereOperator<PaymentMethod>,
    data: Partial<PaymentMethod>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.update(mapToTypeOrmWhere(where), data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<PaymentMethod>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete(mapToTypeOrmWhere(where));
    return result.affected ?? 0;
  }

  // Specialized methods

  async findByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod[]> {
    return this.find(
      {
        where: { userId },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findActiveByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod[]> {
    return this.find(
      {
        where: { userId, isActive: true },
        orderBy: { createdAt: 'desc' },
      },
      transactionManager,
    );
  }

  async findDefaultByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null> {
    return this.findOne(
      {
        where: { userId, isDefault: true, isActive: true },
      },
      transactionManager,
    );
  }

  async findByProviderPaymentMethodId(
    provider: PaymentProvider,
    providerPaymentMethodId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null> {
    const whereCondition: any = { provider };

    if (provider === PaymentProvider.STRIPE) {
      whereCondition.stripePaymentMethodId = providerPaymentMethodId;
    } else if (provider === PaymentProvider.PAYPAL) {
      whereCondition.paypalPaymentMethodId = providerPaymentMethodId;
    }

    return this.findOne({ where: whereCondition }, transactionManager);
  }

  async setAsDefault(
    paymentMethodId: string,
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null> {
    const repo = this.getRepo(transactionManager);

    // First, unset all other default payment methods for this user
    await repo.update({ userId, isDefault: true }, { isDefault: false });

    // Then set this one as default
    await repo.update({ id: paymentMethodId }, { isDefault: true });

    return this.findById(paymentMethodId, transactionManager);
  }

  async deactivate(
    paymentMethodId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null> {
    return this.update(
      paymentMethodId,
      { isActive: false },
      transactionManager,
    );
  }

  async updateLastUsed(
    paymentMethodId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null> {
    return this.update(
      paymentMethodId,
      { lastUsedAt: new Date() },
      transactionManager,
    );
  }
}
