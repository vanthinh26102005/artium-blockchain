import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsOrder } from 'typeorm';
import { OrderItem } from '../../domain/entities';
import { IOrderItemRepository } from '../../domain/interfaces';
import {
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';

@Injectable()
export class OrderItemRepository implements IOrderItemRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly ormRepository: Repository<OrderItem>,
  ) {}

  private getRepo(transactionManager?: EntityManager): Repository<OrderItem> {
    return transactionManager
      ? transactionManager.getRepository(OrderItem)
      : this.ormRepository;
  }

  async create(
    data: Omit<OrderItem, 'id' | 'createdAt'>,
    transactionManager?: EntityManager,
  ): Promise<OrderItem> {
    const repo = this.getRepo(transactionManager);
    const item = repo.create(data);
    return repo.save(item);
  }

  async update(
    itemId: string,
    data: Partial<OrderItem>,
    transactionManager?: EntityManager,
  ): Promise<OrderItem | null> {
    const repo = this.getRepo(transactionManager);
    await repo.update({ id: itemId }, data);
    return this.findById(itemId, transactionManager);
  }

  async delete(
    itemId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete({ id: itemId });
    return (result.affected ?? 0) > 0;
  }

  async findById(
    itemId: string,
    transactionManager?: EntityManager,
  ): Promise<OrderItem | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({
      where: { id: itemId },
    });
  }

  async findOne(
    options: FindOneOptions<OrderItem>,
    transactionManager?: EntityManager,
  ): Promise<OrderItem | null> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options;
    return repo.findOne({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<OrderItem>,
    });
  }

  async find(
    options?: FindManyOptions<OrderItem>,
    transactionManager?: EntityManager,
  ): Promise<OrderItem[]> {
    const repo = this.getRepo(transactionManager);
    const { where, orderBy, ...rest } = options || {};
    return repo.find({
      ...rest,
      where: mapToTypeOrmWhere(where),
      order: orderBy as FindOptionsOrder<OrderItem>,
    });
  }

  async count(
    where?: WhereOperator<OrderItem>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    return repo.count({ where: mapToTypeOrmWhere(where) });
  }

  async exists(
    where: WhereOperator<OrderItem>,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const count = await this.count(where, transactionManager);
    return count > 0;
  }

  async createMany(
    data: Omit<OrderItem, 'id'>[],
    transactionManager?: EntityManager,
  ): Promise<OrderItem[]> {
    const repo = this.getRepo(transactionManager);
    const items = repo.create(data);
    return repo.save(items);
  }

  async updateMany(
    where: WhereOperator<OrderItem>,
    data: Partial<OrderItem>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.update(mapToTypeOrmWhere(where), data);
    return result.affected ?? 0;
  }

  async deleteMany(
    where: WhereOperator<OrderItem>,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(transactionManager);
    const result = await repo.delete(mapToTypeOrmWhere(where));
    return result.affected ?? 0;
  }

  // Specialized methods

  async findByOrderId(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<OrderItem[]> {
    return this.find({ where: { orderId } }, transactionManager);
  }
}
