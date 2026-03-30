import { IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { OrderItem } from '../entities';

export const IOrderItemRepository = Symbol('IOrderItemRepository');

export interface IOrderItemRepository extends IRepository<OrderItem, string> {
  findByOrderId(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<OrderItem[]>;
}
