import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsOrder } from 'typeorm';
import { StripeCustomer } from '../../domain/entities';
import { IStripeCustomerRepository } from '../../domain/interfaces';
import {
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';

@Injectable()
export class StripeCustomerRepository implements IStripeCustomerRepository {
  constructor(
    @InjectRepository(StripeCustomer)
    private readonly ormRepository: Repository<StripeCustomer>,
  ) {}

  private getRepo(
    transactionManager?: EntityManager,
  ): Repository<StripeCustomer> {
    return transactionManager
      ? transactionManager.getRepository(StripeCustomer)
      : this.ormRepository;
  }

  async create(
    data: Omit<StripeCustomer, 'id' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer> {
    const repo = this.getRepo(transactionManager);
    const customer = repo.create(data);
    return repo.save(customer);
  }

  async update(
    id: string,
    data: Partial<StripeCustomer>,
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer | null> {
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
  ): Promise<StripeCustomer | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<StripeCustomer>,
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer | null> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options;
    return repo.findOne({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<StripeCustomer>,
    });
  }

  async find(
    options?: FindManyOptions<StripeCustomer>,
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer[]> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options || {};
    return repo.find({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<StripeCustomer>,
    });
  }

  async count(
    where?: WhereOperator<StripeCustomer>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    return repo.count({ where: mapToTypeOrmWhere(where) });
  }

  async exists(
    where: WhereOperator<StripeCustomer>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(where, transactionManager);
    return count > 0;
  }

  async createMany(
    data: Omit<StripeCustomer, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer[]> {
    const repo = this.getRepo(transactionManager);
    const customers = repo.create(data);
    return repo.save(customers);
  }

  async updateMany(
    where: WhereOperator<StripeCustomer>,
    data: Partial<StripeCustomer>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.update(mapToTypeOrmWhere(where), data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<StripeCustomer>,
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
  ): Promise<StripeCustomer | null> {
    return this.findOne(
      { where: { userId, isActive: true } },
      transactionManager,
    );
  }

  async findByStripeId(
    stripeId: string,
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer | null> {
    return this.findOne({ where: { stripeId } }, transactionManager);
  }

  async existsByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    return this.exists({ userId, isActive: true }, transactionManager);
  }

  async deactivate(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer | null> {
    return this.update(id, { isActive: false }, transactionManager);
  }
}
