import { IRepository, PaymentProvider } from '@app/common';
import { EntityManager } from 'typeorm';
import { PaymentMethod } from '../entities';

export const IPaymentMethodRepository = Symbol('IPaymentMethodRepository');

export interface IPaymentMethodRepository extends IRepository<
  PaymentMethod,
  string
> {
  findByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod[]>;

  findActiveByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod[]>;

  findDefaultByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null>;

  findByProviderPaymentMethodId(
    provider: PaymentProvider,
    providerPaymentMethodId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null>;

  setAsDefault(
    paymentMethodId: string,
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null>;

  deactivate(
    paymentMethodId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null>;

  updateLastUsed(
    paymentMethodId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentMethod | null>;
}
