import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsOrder } from 'typeorm';
import { Order } from '../../domain/entities';
import { IOrderRepository } from '../../domain/interfaces';
import {
  OrderStatus,
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly ormRepository: Repository<Order>,
  ) {}

  private getRepo(transactionManager?: EntityManager): Repository<Order> {
    return transactionManager
      ? transactionManager.getRepository(Order)
      : this.ormRepository;
  }

  async create(
    data: Omit<Order, 'id' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<Order> {
    const repo = this.getRepo(transactionManager);
    const order = repo.create(data);
    return repo.save(order);
  }

  async update(
    orderId: string,
    data: Partial<Order>,
    transactionManager?: EntityManager,
  ): Promise<Order | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update({ id: orderId }, data);
    return this.findById(orderId, transactionManager);
  }

  async delete(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete({ id: orderId });
    return (result.affected ?? 0) > 0;
  }

  async findById(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<Order | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({
      where: { id: orderId },
    });
  }

  async findOne(
    options: FindOneOptions<Order>,
    transactionManager?: EntityManager,
  ): Promise<Order | null> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options;
    return repo.findOne({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Order>,
    });
  }

  async find(
    options?: FindManyOptions<Order>,
    transactionManager?: EntityManager,
  ): Promise<Order[]> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options || {};
    return repo.find({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<Order>,
    });
  }

  async count(
    where?: WhereOperator<Order>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    return repo.count({ where: mapToTypeOrmWhere(where) });
  }

  async exists(
    where: WhereOperator<Order>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(where, transactionManager);
    return count > 0;
  }

  async createMany(
    data: Omit<Order, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<Order[]> {
    const repo = this.getRepo(transactionManager);
    const orders = repo.create(data);
    return repo.save(orders);
  }

  async updateMany(
    where: WhereOperator<Order>,
    data: Partial<Order>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.update(mapToTypeOrmWhere(where), data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<Order>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete(mapToTypeOrmWhere(where));
    return result.affected ?? 0;
  }

  // Specialized methods

  async findByCollectorId(
    collectorId: string,
    transactionManager?: EntityManager,
  ): Promise<Order[]> {
    return this.find({ where: { collectorId } }, transactionManager);
  }

  async findByOnChainOrderId(
    onChainOrderId: string,
    transactionManager?: EntityManager,
  ): Promise<Order | null> {
    return this.findOne({ where: { onChainOrderId } }, transactionManager);
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    transactionManager?: EntityManager,
  ): Promise<Order | null> {
    await this.update(orderId, { status }, transactionManager);
    return this.findById(orderId, transactionManager);
  }
}
