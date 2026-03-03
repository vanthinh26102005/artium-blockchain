import { IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { StripeCustomer } from '../entities';

export const IStripeCustomerRepository = Symbol('IStripeCustomerRepository');

export interface IStripeCustomerRepository extends IRepository<
  StripeCustomer,
  string
> {
  findByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer | null>;

  findByStripeId(
    stripeId: string,
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer | null>;

  existsByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean>;

  deactivate(
    id: string,
    transactionManager?: EntityManager,
  ): Promise<StripeCustomer | null>;
}
