import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { EntityManager } from 'typeorm';
import {
  ITransactionService,
  InvoiceStatus,
  RpcExceptionHelper,
} from '@app/common';
import {
  OrderInvoiceObject,
  OrderInvoiceSourceOrderDto,
} from '@app/common/dtos/payments/invoices/order-invoice.dto';
import { GetOrderInvoiceQuery } from '../GetOrderInvoice.query';
import { Invoice } from '../../../../domain/entities';
import {
  IInvoiceItemRepository,
  IInvoiceRepository,
  IPaymentTransactionRepository,
} from '../../../../domain/interfaces';
import { PaymentTransaction } from '../../../../domain/entities/payment-transaction.entity';

@QueryHandler(GetOrderInvoiceQuery)
export class GetOrderInvoiceHandler implements IQueryHandler<GetOrderInvoiceQuery> {
  private readonly logger = new Logger(GetOrderInvoiceHandler.name);

  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject(IInvoiceItemRepository)
    private readonly invoiceItemRepo: IInvoiceItemRepository,
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(query: GetOrderInvoiceQuery): Promise<OrderInvoiceObject> {
    try {
      const { sourceOrder } = query;
      this.logger.log(`Getting order invoice for order: ${sourceOrder.id}`);

      const existingInvoice = await this.invoiceRepo.findByOrderId(
        sourceOrder.id,
      );
      const paymentTransactions = await this.transactionRepo.findByOrderId(
        sourceOrder.id,
      );

      if (existingInvoice) {
        return this.mapInvoiceToOrderInvoiceObject(
          existingInvoice,
          sourceOrder,
          paymentTransactions,
        );
      }

      const invoice = await this.materializeOrderInvoice(sourceOrder);
      const refreshedTransactions = await this.transactionRepo.findByOrderId(
        sourceOrder.id,
      );

      return this.mapInvoiceToOrderInvoiceObject(
        invoice,
        sourceOrder,
        refreshedTransactions,
      );
    } catch (error) {
      const duplicateInvoice = await this.findExistingAfterDuplicate(
        error,
        query,
      );
      if (duplicateInvoice) {
        const paymentTransactions = await this.transactionRepo.findByOrderId(
          query.sourceOrder.id,
        );
        return this.mapInvoiceToOrderInvoiceObject(
          duplicateInvoice,
          query.sourceOrder,
          paymentTransactions,
        );
      }

      this.logger.error(`Failed to get order invoice`, error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }

  private async materializeOrderInvoice(
    sourceOrder: OrderInvoiceSourceOrderDto,
  ): Promise<Invoice> {
    return this.transactionService.execute(async (manager) => {
      const invoiceNumber = `INV-${sourceOrder.orderNumber}`;
      const sellerId = sourceOrder.items[0]?.sellerId;

      if (!sellerId) {
        throw RpcExceptionHelper.badRequest(
          'Order invoice materialization requires at least one seller item',
        );
      }

      const invoice = await this.invoiceRepo.create(
        {
          sellerId,
          collectorId: sourceOrder.collectorId,
          customerEmail: null,
          invoiceNumber,
          status:
            sourceOrder.paymentStatus === 'paid'
              ? InvoiceStatus.PAID
              : InvoiceStatus.SENT,
          orderId: sourceOrder.id,
          subtotal: sourceOrder.subtotal,
          taxAmount: sourceOrder.taxAmount,
          discountAmount: sourceOrder.discountAmount || 0,
          totalAmount: sourceOrder.totalAmount,
          currency: sourceOrder.currency,
          paymentTransactionId: sourceOrder.paymentTransactionId,
          paidAt:
            sourceOrder.paymentStatus === 'paid'
              ? this.toDate(sourceOrder.confirmedAt) || new Date()
              : null,
          issueDate: this.toDate(sourceOrder.createdAt),
          dueDate: null,
        },
        manager,
      );

      await this.invoiceItemRepo.createMany(
        sourceOrder.items.map((item) => ({
          invoiceId: invoice.id,
          artworkId: item.artworkId,
          artworkTitle: item.artworkTitle,
          artworkImageUrl: item.artworkImageUrl,
          description: item.artworkTitle || 'Artwork purchase',
          quantity: item.quantity,
          unitPrice: item.priceAtPurchase,
          lineTotal: item.priceAtPurchase * item.quantity,
          taxRate: 0,
          taxAmount: 0,
          discountAmount: 0,
          notes: null,
          createdAt: new Date(),
        })),
        manager,
      );

      if (sourceOrder.paymentTransactionId) {
        await this.transactionRepo.update(
          sourceOrder.paymentTransactionId,
          { invoiceId: invoice.id },
          manager,
        );
      }

      const createdInvoice = await this.invoiceRepo.findById(
        invoice.id,
        manager,
      );
      if (!createdInvoice) {
        throw RpcExceptionHelper.internalError(
          `Invoice ${invoice.id} was not found after materialization`,
        );
      }

      return createdInvoice;
    });
  }

  private async findExistingAfterDuplicate(
    error: any,
    query: GetOrderInvoiceQuery,
  ): Promise<Invoice | null> {
    if (!this.isDuplicateInvoiceNumberError(error)) {
      return null;
    }

    const { sourceOrder } = query;
    const invoiceNumber = `INV-${sourceOrder.orderNumber}`;

    this.logger.warn(
      `Duplicate invoice number ${invoiceNumber}; re-reading existing order invoice`,
    );

    const byOrderId = await this.invoiceRepo.findByOrderId(sourceOrder.id);
    if (byOrderId) {
      return byOrderId;
    }

    return this.invoiceRepo.findByInvoiceNumber(invoiceNumber);
  }

  private isDuplicateInvoiceNumberError(error: any): boolean {
    const message = String(error?.message || '').toLowerCase();
    return (
      error?.code === '23505' ||
      error?.code === 'ER_DUP_ENTRY' ||
      (message.includes('duplicate') && message.includes('invoice'))
    );
  }

  private toDate(value?: Date | string | null): Date | null {
    if (!value) {
      return null;
    }
    return value instanceof Date ? value : new Date(value);
  }

  private mapInvoiceToOrderInvoiceObject(
    invoice: Invoice,
    sourceOrder: OrderInvoiceSourceOrderDto,
    paymentTransactions: PaymentTransaction[],
  ): OrderInvoiceObject {
    const paymentTransaction =
      paymentTransactions.find(
        (transaction) => transaction.id === invoice.paymentTransactionId,
      ) || paymentTransactions[0];
    const firstItem = sourceOrder.items[0];

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber || `INV-${sourceOrder.orderNumber}`,
      status: invoice.status,
      orderId: invoice.orderId || sourceOrder.id,
      orderNumber: sourceOrder.orderNumber,
      issueDate: invoice.issueDate || sourceOrder.createdAt,
      dueDate: invoice.dueDate || null,
      paidAt: invoice.paidAt || null,
      currency: invoice.currency || sourceOrder.currency,
      subtotal: Number(invoice.subtotal ?? sourceOrder.subtotal),
      taxAmount: Number(invoice.taxAmount ?? sourceOrder.taxAmount),
      discountAmount: Number(
        invoice.discountAmount ?? sourceOrder.discountAmount ?? 0,
      ),
      shippingAmount: Number(sourceOrder.shippingCost || 0),
      totalAmount: Number(invoice.totalAmount ?? sourceOrder.totalAmount),
      buyer: {
        id: sourceOrder.collectorId,
      },
      seller: {
        id: invoice.sellerId || firstItem?.sellerId,
      },
      shippingAddress: sourceOrder.shippingAddress || null,
      billingAddress: sourceOrder.billingAddress || null,
      payment: {
        paymentStatus: sourceOrder.paymentStatus,
        paymentMethod: sourceOrder.paymentMethod || null,
        paymentTransactionId:
          invoice.paymentTransactionId ||
          sourceOrder.paymentTransactionId ||
          paymentTransaction?.id ||
          null,
        paymentIntentId:
          sourceOrder.paymentIntentId ||
          paymentTransaction?.stripePaymentIntentId ||
          null,
        txHash: sourceOrder.txHash || paymentTransaction?.txHash || null,
        onChainOrderId: sourceOrder.onChainOrderId || null,
      },
      items: (invoice.items || []).map((item) => {
        const sourceItem = sourceOrder.items.find(
          (candidate) => candidate.artworkId === item.artworkId,
        );

        return {
          id: item.id,
          artworkId: item.artworkId || sourceItem?.artworkId || null,
          sellerId: sourceItem?.sellerId || firstItem?.sellerId || null,
          artworkTitle: item.artworkTitle || sourceItem?.artworkTitle || null,
          artworkImageUrl:
            item.artworkImageUrl || sourceItem?.artworkImageUrl || null,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(
            item.lineTotal ?? Number(item.unitPrice) * Number(item.quantity),
          ),
          taxAmount: Number(item.taxAmount || 0),
          discountAmount: Number(item.discountAmount || 0),
        };
      }),
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt || invoice.createdAt,
    };
  }
}
