import { NotFoundException } from '@nestjs/common';
import { jest, beforeEach, describe, expect, it } from '@jest/globals';

import { OrdersController } from './orders.controller';
import { sendRpc } from '../utils';

jest.mock('../utils', () => ({
  sendRpc: jest.fn(),
}));

describe('OrdersController', () => {
  const ordersClientMock = { send: jest.fn() };
  const paymentsClientMock = { send: jest.fn() };
  const sendRpcMock = sendRpc as unknown as jest.Mock;

  const order = {
    id: 'order-1',
    collectorId: 'buyer-1',
    orderNumber: 'ORD-1700000000-ABC123',
    status: 'confirmed',
    subtotal: 100,
    shippingCost: 10,
    taxAmount: 5,
    discountAmount: 0,
    totalAmount: 115,
    currency: 'USD',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    paymentIntentId: 'pi-1',
    paymentTransactionId: 'tx-1',
    shippingAddress: { city: 'Ho Chi Minh City' },
    billingAddress: { city: 'Ho Chi Minh City' },
    customerNotes: null,
    onChainOrderId: null,
    txHash: null,
    confirmedAt: new Date('2026-04-30T00:02:00.000Z'),
    createdAt: new Date('2026-04-30T00:00:00.000Z'),
    updatedAt: new Date('2026-04-30T00:01:00.000Z'),
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        artworkId: 'artwork-1',
        sellerId: 'seller-1',
        artworkTitle: 'Blue Study',
        artworkImageUrl: 'https://example.test/blue-study.jpg',
        priceAtPurchase: 100,
        quantity: 1,
        currency: 'USD',
        payoutStatus: 'pending',
      },
    ],
  };

  const invoice = {
    id: 'invoice-1',
    invoiceNumber: 'INV-ORD-1700000000-ABC123',
    status: 'paid',
    orderId: 'order-1',
    orderNumber: 'ORD-1700000000-ABC123',
    currency: 'USD',
    subtotal: 100,
    taxAmount: 5,
    discountAmount: 0,
    shippingAmount: 10,
    totalAmount: 115,
    buyer: { id: 'buyer-1' },
    seller: { id: 'seller-1' },
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    payment: {
      paymentStatus: 'paid',
      paymentMethod: 'card',
      paymentTransactionId: 'tx-1',
      paymentIntentId: 'pi-1',
      txHash: null,
      onChainOrderId: null,
    },
    items: [],
    createdAt: new Date('2026-04-30T00:02:00.000Z'),
    updatedAt: new Date('2026-04-30T00:03:00.000Z'),
  };

  let controller: OrdersController;

  beforeEach(() => {
    sendRpcMock.mockReset();
    controller = new OrdersController(
      ordersClientMock as any,
      paymentsClientMock as any,
    );
  });

  it('returns an order invoice for an authorized buyer', async () => {
    sendRpcMock.mockImplementation(async (_client: any, pattern: any) =>
      pattern.cmd === 'get_order_by_id' ? order : invoice,
    );

    await expect(
      controller.getOrderInvoice('order-1', { user: { id: 'buyer-1' } }),
    ).resolves.toEqual(invoice);

    expect(sendRpcMock).toHaveBeenNthCalledWith(
      1,
      ordersClientMock,
      { cmd: 'get_order_by_id' },
      { id: 'order-1' },
    );
    expect(sendRpcMock).toHaveBeenNthCalledWith(
      2,
      paymentsClientMock,
      { cmd: 'get_or_materialize_order_invoice' },
      expect.objectContaining({
        order: expect.objectContaining({ id: 'order-1' }),
      }),
    );
  });

  it('returns an order invoice for an authorized seller', async () => {
    sendRpcMock.mockImplementation(async (_client: any, pattern: any) =>
      pattern.cmd === 'get_order_by_id'
        ? {
            ...order,
            items: [
              ...order.items,
              {
                id: 'item-2',
                orderId: 'order-1',
                artworkId: 'artwork-2',
                sellerId: 'seller-2',
                artworkTitle: 'Red Study',
                artworkImageUrl: null,
                priceAtPurchase: 50,
                quantity: 1,
                currency: 'USD',
                payoutStatus: 'pending',
              },
            ],
          }
        : {
            ...invoice,
            shippingAddress: { city: 'Ho Chi Minh City' },
            billingAddress: { city: 'Ho Chi Minh City' },
            payment: {
              ...invoice.payment,
              paymentTransactionId: 'tx-1',
              paymentIntentId: 'pi-1',
              txHash: '0xabc',
            },
            items: [
              { id: 'invoice-item-1', sellerId: 'seller-1' },
              { id: 'invoice-item-2', sellerId: 'seller-2' },
            ],
          },
    );

    const result = await controller.getOrderInvoice('order-1', {
      user: { id: 'seller-1' },
    });

    expect(result).toEqual(
      expect.objectContaining({
        shippingAddress: null,
        billingAddress: null,
        payment: expect.objectContaining({
          paymentTransactionId: null,
          paymentIntentId: null,
          txHash: null,
        }),
        items: [{ id: 'invoice-item-1', sellerId: 'seller-1' }],
      }),
    );
  });

  it('throws not found before payment RPC for buyerless seller orders', async () => {
    sendRpcMock.mockImplementation(async () => ({
      ...order,
      collectorId: null,
    }));

    await expect(
      controller.getOrderInvoice('order-1', { user: { id: 'seller-1' } }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(
      sendRpcMock.mock.calls.some(([, pattern]: any[]) => {
        return pattern.cmd === 'get_or_materialize_order_invoice';
      }),
    ).toBe(false);
  });

  it('throws not found before payment RPC for an unauthorized user', async () => {
    sendRpcMock.mockImplementation(async () => order);

    await expect(
      controller.getOrderInvoice('order-1', { user: { id: 'other-user' } }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(
      sendRpcMock.mock.calls.some(([, pattern]: any[]) => {
        return pattern.cmd === 'get_or_materialize_order_invoice';
      }),
    ).toBe(false);
  });

  it('passes sanitized order source data to payments-service', async () => {
    sendRpcMock.mockImplementation(async (_client: any, pattern: any) =>
      pattern.cmd === 'get_order_by_id' ? order : invoice,
    );

    await controller.getOrderInvoice('order-1', { user: { id: 'buyer-1' } });

    expect(sendRpcMock).toHaveBeenLastCalledWith(
      paymentsClientMock,
      { cmd: 'get_or_materialize_order_invoice' },
      {
        order: expect.objectContaining({
          id: 'order-1',
          orderNumber: 'ORD-1700000000-ABC123',
          collectorId: 'buyer-1',
          paymentTransactionId: 'tx-1',
          items: [
            expect.objectContaining({
              sellerId: 'seller-1',
              artworkTitle: 'Blue Study',
              priceAtPurchase: 100,
              quantity: 1,
            }),
          ],
        }),
      },
    );
  });
});
