import { IRepository, TransactionType, TransactionStatus } from '@app/common';
import { EntityManager } from 'typeorm';
import { PaymentTransaction } from '../entities';

export const IPaymentTransactionRepository = Symbol(
  'IPaymentTransactionRepository',
);

export interface IPaymentTransactionRepository extends IRepository<
  PaymentTransaction,
  string
> {
  findByUserId(
    userId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]>;

  findBySellerId(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]>;

  findByOrderId(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]>;

  findByInvoiceId(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]>;

  findByType(
    type: TransactionType,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]>;

  findByStatus(
    status: TransactionStatus,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]>;

  findByStripePaymentIntentId(
    stripePaymentIntentId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null>;

  findByStripeChargeId(
    stripeChargeId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null>;

  findByPaypalOrderId(
    paypalOrderId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null>;

  updateStatus(
    transactionId: string,
    status: TransactionStatus,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null>;

  markAsCompleted(
    transactionId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null>;

  markAsFailed(
    transactionId: string,
    failureReason: string,
    failureCode?: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null>;

  recordRefund(
    transactionId: string,
    refundAmount: number,
    refundReason: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction | null>;

  getTotalAmountBySeller(
    sellerId: string,
    status?: TransactionStatus,
    transactionManager?: EntityManager,
  ): Promise<number>;

  findPendingForPayout(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<PaymentTransaction[]>;
}
