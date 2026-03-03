import { IRepository, PayoutStatus, PayoutProvider } from '@app/common';
import { EntityManager } from 'typeorm';
import { Payout } from '../entities';

export const IPayoutRepository = Symbol('IPayoutRepository');

export interface IPayoutRepository extends IRepository<Payout, string> {
  findBySellerId(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<Payout[]>;

  findByStatus(
    status: PayoutStatus,
    transactionManager?: EntityManager,
  ): Promise<Payout[]>;

  findByProvider(
    provider: PayoutProvider,
    transactionManager?: EntityManager,
  ): Promise<Payout[]>;

  findScheduledPayouts(transactionManager?: EntityManager): Promise<Payout[]>;

  markAsProcessed(
    payoutId: string,
    transactionManager?: EntityManager,
  ): Promise<Payout | null>;

  markAsCompleted(
    payoutId: string,
    arrivalDate?: Date,
    transactionManager?: EntityManager,
  ): Promise<Payout | null>;

  markAsFailed(
    payoutId: string,
    failureReason: string,
    failureCode?: string,
    transactionManager?: EntityManager,
  ): Promise<Payout | null>;

  getTotalPayoutAmountBySeller(
    sellerId: string,
    status?: PayoutStatus,
    transactionManager?: EntityManager,
  ): Promise<number>;
}
