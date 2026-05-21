import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  EscrowState,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
} from '@app/common';
import { ConfirmDeliveryCommand } from '../ConfirmDelivery.command';
import { ConfirmDeliveryHandler } from './ConfirmDelivery.command.handler';

describe('ConfirmDeliveryHandler', () => {
  const shippedOrder = {
    id: 'order-1',
    collectorId: 'buyer-1',
    status: OrderStatus.SHIPPED,
    paymentMethod: OrderPaymentMethod.STRIPE,
    paymentStatus: OrderPaymentStatus.PAID,
    buyerWallet: null,
    onChainOrderId: null,
    escrowState: null,
  };

  const orderRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  let handler: ConfirmDeliveryHandler;

  beforeEach(() => {
    orderRepo.findById = jest.fn(async () => shippedOrder);
    orderRepo.update = jest.fn(async (_id, data: Record<string, unknown>) => ({
      ...shippedOrder,
      ...data,
    }));
    handler = new ConfirmDeliveryHandler(orderRepo as never);
  });

  it('marks a normal shipped order delivered with signature metadata', async () => {
    await handler.execute(
      new ConfirmDeliveryCommand('order-1', 'buyer-1', {
        notes: 'Arrived in good condition',
        confirmationMethod: 'app_signature',
        signatureDataUrl: 'data:image/png;base64,abc',
      }),
    );

    expect(orderRepo.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        status: OrderStatus.DELIVERED,
        deliveryConfirmedBy: 'buyer-1',
        deliveryConfirmationMethod: 'app_signature',
        deliveryConfirmationNotes: 'Arrived in good condition',
        deliverySignatureDataUrl: 'data:image/png;base64,abc',
      }),
    );
  });

  it('records blockchain delivery confirmation without completing before event sync', async () => {
    const auctionOrder = {
      ...shippedOrder,
      collectorId: null,
      paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
      paymentStatus: OrderPaymentStatus.ESCROW,
      buyerWallet: '0xabc',
      onChainOrderId: '42',
      escrowState: EscrowState.SHIPPED,
    };
    orderRepo.findById = jest.fn(async () => auctionOrder);

    await handler.execute(
      new ConfirmDeliveryCommand(
        'order-1',
        'buyer-1',
        {
          confirmationMethod: 'wallet',
          transactionHash: '0x123',
          signatureDataUrl: 'data:image/png;base64,abc',
        },
        '0xAbC',
      ),
    );

    expect(orderRepo.update).toHaveBeenCalledWith(
      'order-1',
      expect.not.objectContaining({
        status: OrderStatus.DELIVERED,
        deliveredAt: expect.any(Date),
      }),
    );
    expect(orderRepo.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        deliveryConfirmationMethod: 'wallet',
        deliveryConfirmationTxHash: '0x123',
        deliverySignatureDataUrl: 'data:image/png;base64,abc',
      }),
    );
  });
});
