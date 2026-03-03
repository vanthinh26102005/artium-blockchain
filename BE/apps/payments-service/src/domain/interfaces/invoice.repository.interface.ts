import { IRepository, InvoiceStatus } from '@app/common';
import { EntityManager } from 'typeorm';
import { Invoice } from '../entities';

export const IInvoiceRepository = Symbol('IInvoiceRepository');

export interface IInvoiceRepository extends IRepository<Invoice, string> {
  findBySellerId(
    sellerId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice[]>;

  findByCollectorId(
    collectorId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice[]>;

  findByStatus(
    status: InvoiceStatus,
    transactionManager?: EntityManager,
  ): Promise<Invoice[]>;

  findByOrderId(
    orderId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null>;

  findByInvoiceNumber(
    invoiceNumber: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null>;

  findOverdueInvoices(transactionManager?: EntityManager): Promise<Invoice[]>;

  markAsPaid(
    invoiceId: string,
    paymentTransactionId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null>;

  cancelInvoice(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null>;

  updateStatus(
    invoiceId: string,
    status: InvoiceStatus,
    transactionManager?: EntityManager,
  ): Promise<Invoice | null>;
}
