import { IRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { InvoiceItem } from '../entities';

export const IInvoiceItemRepository = Symbol('IInvoiceItemRepository');

export interface IInvoiceItemRepository extends IRepository<
  InvoiceItem,
  string
> {
  findByInvoiceId(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem[]>;

  findByArtworkId(
    artworkId: string,
    transactionManager?: EntityManager,
  ): Promise<InvoiceItem[]>;

  deleteByInvoiceId(
    invoiceId: string,
    transactionManager?: EntityManager,
  ): Promise<number>;
}
