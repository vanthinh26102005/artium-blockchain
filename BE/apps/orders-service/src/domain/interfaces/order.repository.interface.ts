import { IRepository, OrderStatus } from '@app/common';
import { EntityManager } from 'typeorm';
import { Order } from '../entities';

export const IOrderRepository = Symbol('IOrderRepository');

export interface IOrderRepository extends IRepository<Order, string> {
  findByCollectorId(
    collectorId: string,
    transactionManager?: EntityManager,
  ): Promise<Order[]>;

  findByOnChainOrderId(
    onChainOrderId: string,
    transactionManager?: EntityManager,
  ): Promise<Order | null>;

  updateStatus(
    orderId: string,
    status: OrderStatus,
    transactionManager?: EntityManager,
  ): Promise<Order | null>;

  findBySellerIdViaItems(
    sellerId: string,
    options?: { skip?: number; take?: number },
    transactionManager?: EntityManager,
  ): Promise<{ data: Order[]; total: number }>;

  findWithItems(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<Order | null>;
}
