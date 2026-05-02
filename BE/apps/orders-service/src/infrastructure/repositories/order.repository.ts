import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOptionsOrder } from 'typeorm';
import { Order } from '../../domain/entities';
import {
  IOrderRepository,
  SellerOrderListOptions,
} from '../../domain/interfaces';
import {
  OrderStatus,
  FindManyOptions,
  FindOneOptions,
  WhereOperator,
  mapToTypeOrmWhere,
} from '@app/common';

export const ACTIVE_ARTWORK_LOCK_ORDER_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.AUCTION_ACTIVE,
  OrderStatus.ESCROW_HELD,
  OrderStatus.DISPUTE_OPEN,
];

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

  async findBySellerIdViaItems(
    sellerId: string,
    options?: SellerOrderListOptions,
    transactionManager?: EntityManager,
  ): Promise<{ data: Order[]; total: number }> {
    const repo = this.getRepo(transactionManager);
    const qb = repo
      .createQueryBuilder('order')
      .innerJoin('order_items', 'item', 'item.order_id = order.order_id')
      .where('item.seller_id = :sellerId', { sellerId })
      .distinct(true)
      .orderBy('order.created_at', 'DESC');

    if (options?.status) {
      qb.andWhere('order.status = :status', { status: options.status });
    }

    if (options?.onChainOrderId) {
      qb.andWhere('order.on_chain_order_id = :onChainOrderId', {
        onChainOrderId: options.onChainOrderId,
      });
    }

    if (options?.escrowState !== undefined) {
      qb.andWhere('order.escrow_state = :escrowState', {
        escrowState: options.escrowState,
      });
    }

    if (options?.paymentMethod) {
      qb.andWhere('order.payment_method = :paymentMethod', {
        paymentMethod: options.paymentMethod,
      });
    }

    const total = await qb.getCount();

    if (options?.skip) qb.skip(options.skip);
    qb.take(options?.take ?? 20);

    const data = await qb.getMany();
    return { data, total };
  }

  async findActiveArtworkLocks(
    sellerId: string,
    artworkIds: string[],
    transactionManager?: EntityManager,
  ): Promise<string[]> {
    if (artworkIds.length === 0) {
      return [];
    }

    const repo = this.getRepo(transactionManager);
    const rows = await repo
      .createQueryBuilder('order')
      .innerJoin('order_items', 'item', 'item.order_id = order.order_id')
      .select('DISTINCT item.artwork_id', 'artworkId')
      .where('item.seller_id = :sellerId', { sellerId })
      .andWhere('item.artwork_id IN (:...artworkIds)', { artworkIds })
      .andWhere('order.status IN (:...activeStatuses)', {
        activeStatuses: ACTIVE_ARTWORK_LOCK_ORDER_STATUSES,
      })
      .getRawMany<{ artworkId: string }>();

    return rows.map((row) => row.artworkId);
  }

  async findWithItems(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<Order | null> {
    const repo = this.getRepo(transactionManager);
    return repo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }
}
