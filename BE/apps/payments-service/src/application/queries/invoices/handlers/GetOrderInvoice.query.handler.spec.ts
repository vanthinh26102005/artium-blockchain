import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InvoiceStatus, PaymentProvider, TransactionStatus, TransactionType } from '@app/common';

import { GetOrderInvoiceQuery } from '../GetOrderInvoice.query';
import { GetOrderInvoiceHandler } from './GetOrderInvoice.query.handler';

describe('GetOrderInvoiceHandler', () => {
  const manager = {} as never;

  const sourceOrder = {
    id: 'order-1',
    orderNumber: 'ORD-1700000000-ABC123',
    collectorId: 'buyer-1',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    paymentTransactionId: 'tx-1',
    paymentIntentId: 'pi-1',
    txHash: null,
    onChainOrderId: null,
    subtotal: 100,
    shippingCost: 10,
    taxAmount: 5,
    discountAmount: 0,
    totalAmount: 115,
    currency: 'USD',
    shippingAddress: { city: 'Ho Chi Minh City' },
    billingAddress: { city: 'Ho Chi Minh City' },
    items: [
      {
        id: 'item-1',
        artworkId: 'artwork-1',
        sellerId: 'seller-1',
        artworkTitle: 'Blue Study',
        artworkImageUrl: 'https://example.test/blue-study.jpg',
        priceAtPurchase: 100,
        quantity: 1,
      },
    ],
    createdAt: '2026-04-30T00:00:00.000Z',
    updatedAt: '2026-04-30T00:01:00.000Z',
    confirmedAt: '2026-04-30T00:02:00.000Z',
  };

  const invoiceItem = {
    id: 'invoice-item-1',
    invoiceId: 'invoice-1',
    artworkId: 'artwork-1',
    artworkTitle: 'Blue Study',
    artworkImageUrl: 'https://example.test/blue-study.jpg',
    description: 'Blue Study',
    quantity: 1,
    unitPrice: 100,
    lineTotal: 100,
    taxAmount: 0,
    discountAmount: 0,
    createdAt: new Date('2026-04-30T00:02:00.000Z'),
  };

  const invoice = {
    id: 'invoice-1',
    sellerId: 'seller-1',
    collectorId: 'buyer-1',
    customerEmail: null,
    invoiceNumber: 'INV-ORD-1700000000-ABC123',
    status: InvoiceStatus.PAID,
    orderId: 'order-1',
    subtotal: 100,
    taxAmount: 5,
    discountAmount: 0,
    totalAmount: 115,
    currency: 'USD',
    paymentTransactionId: 'tx-1',
    paidAt: new Date('2026-04-30T00:02:00.000Z'),
    issueDate: new Date('2026-04-30T00:00:00.000Z'),
    dueDate: null,
    items: [invoiceItem],
    createdAt: new Date('2026-04-30T00:02:00.000Z'),
    updatedAt: new Date('2026-04-30T00:03:00.000Z'),
  };

  const paymentTransaction = {
    id: 'tx-1',
    type: TransactionType.PAYMENT,
    status: TransactionStatus.SUCCEEDED,
    provider: PaymentProvider.STRIPE,
    userId: 'buyer-1',
    sellerId: 'seller-1',
    orderId: 'order-1',
    invoiceId: 'invoice-1',
    amount: 115,
    currency: 'USD',
    stripePaymentIntentId: 'pi-1',
    txHash: null,
    createdAt: new Date('2026-04-30T00:02:00.000Z'),
  };

  const invoiceRepo = {
    findByOrderId: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByInvoiceNumber: jest.fn(),
  };
  const invoiceItemRepo = {
    createMany: jest.fn(),
  };
  const transactionRepo = {
    findByOrderId: jest.fn(),
    update: jest.fn(),
  };
  const transactionService = {
    execute: jest.fn(),
  };

  let handler: GetOrderInvoiceHandler;

  beforeEach(() => {
    invoiceRepo.findByOrderId = jest.fn();
    invoiceRepo.create = jest.fn();
    invoiceRepo.findById = jest.fn();
    invoiceRepo.findByInvoiceNumber = jest.fn();
    invoiceItemRepo.createMany = jest.fn();
    transactionRepo.findByOrderId = jest.fn(async () => [paymentTransaction]);
    transactionRepo.update = jest.fn();
    transactionService.execute = jest.fn(async (work: (manager: never) => unknown) =>
      work(manager),
    );

    handler = new GetOrderInvoiceHandler(
      invoiceRepo as never,
      invoiceItemRepo as never,
      transactionRepo as never,
      transactionService as never,
    );
  });

  it('returns an existing order invoice', async () => {
    invoiceRepo.findByOrderId = jest.fn(async () => invoice);

    const result = await handler.execute(new GetOrderInvoiceQuery(sourceOrder));

    expect(result.id).toBe('invoice-1');
    expect(result.invoiceNumber).toBe('INV-ORD-1700000000-ABC123');
    expect(result.payment.paymentTransactionId).toBe('tx-1');
    expect(invoiceRepo.create).not.toHaveBeenCalled();
  });

  it('materializes a missing paid order invoice', async () => {
    invoiceRepo.findByOrderId = jest.fn(async () => null);
    invoiceRepo.create = jest.fn(async () => ({ ...invoice, items: [] }));
    invoiceRepo.findById = jest.fn(async () => invoice);

    const result = await handler.execute(new GetOrderInvoiceQuery(sourceOrder));

    expect(result.status).toBe(InvoiceStatus.PAID);
    expect(result.items[0].artworkTitle).toBe('Blue Study');
    expect(invoiceRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceNumber: 'INV-ORD-1700000000-ABC123',
        status: InvoiceStatus.PAID,
        orderId: 'order-1',
        sellerId: 'seller-1',
        collectorId: 'buyer-1',
        paymentTransactionId: 'tx-1',
      }),
      manager,
    );
    expect(invoiceItemRepo.createMany).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          invoiceId: 'invoice-1',
          artworkTitle: 'Blue Study',
          quantity: 1,
          unitPrice: 100,
          lineTotal: 100,
        }),
      ],
      manager,
    );
  });

  it('returns the same invoice on repeated materialization', async () => {
    let findByOrderIdCalls = 0;
    invoiceRepo.findByOrderId = jest.fn(async () => {
      findByOrderIdCalls += 1;
      return findByOrderIdCalls === 1 ? null : invoice;
    });
    invoiceRepo.create = jest.fn(async () => {
      const error = new Error('duplicate invoice number');
      (error as { code?: string }).code = '23505';
      throw error;
    });

    const result = await handler.execute(new GetOrderInvoiceQuery(sourceOrder));

    expect(result.id).toBe('invoice-1');
    expect(invoiceRepo.findByInvoiceNumber).not.toHaveBeenCalled();
  });

  it('links the payment transaction to the materialized invoice', async () => {
    invoiceRepo.findByOrderId = jest.fn(async () => null);
    invoiceRepo.create = jest.fn(async () => ({ ...invoice, items: [] }));
    invoiceRepo.findById = jest.fn(async () => invoice);

    await handler.execute(new GetOrderInvoiceQuery(sourceOrder));

    expect(transactionRepo.update).toHaveBeenCalledWith(
      'tx-1',
      { invoiceId: 'invoice-1' },
      manager,
    );
  });
});
