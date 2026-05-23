import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  EscrowState,
  OrderPaymentMethod,
  OrderStatus,
  RpcExceptionHelper,
} from '@app/common';
import { MarkShippedCommand } from '../MarkShipped.command';
import { MarkShippedHandler } from './MarkShipped.command.handler';

describe('MarkShippedHandler', () => {
  const orderRepo = {
    findWithItems: jest.fn(),
    update: jest.fn(),
  };

  const baseOrder = {
    id: 'order-1',
    status: OrderStatus.ESCROW_HELD,
    paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
    onChainOrderId: 'AUC-001',
    items: [{ sellerId: 'seller-1' }],
  };

  let handler: MarkShippedHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new MarkShippedHandler(orderRepo as any);
  });

  it('records blockchain shipment tx evidence without moving local state before chain sync', async () => {
    orderRepo.findWithItems.mockImplementation(async () => baseOrder);
    orderRepo.update.mockImplementation(
      async (_id, patch: Record<string, unknown>) => ({
        ...baseOrder,
        ...patch,
      }),
    );

    await expect(
      handler.execute(
        new MarkShippedCommand('order-1', 'seller-1', {
          carrier: 'FedEx',
          trackingNumber: 'TRACK-1',
          transactionHash:
            '0x1111111111111111111111111111111111111111111111111111111111111111',
        }),
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        carrier: 'FedEx',
        trackingNumber: 'TRACK-1',
        txHash:
          '0x1111111111111111111111111111111111111111111111111111111111111111',
      }),
    );

    expect(orderRepo.update).toHaveBeenCalledWith('order-1', {
      carrier: 'FedEx',
      trackingNumber: 'TRACK-1',
      shippingMethod: null,
      txHash:
        '0x1111111111111111111111111111111111111111111111111111111111111111',
    });
  });

  it('rejects blockchain shipment without a valid transaction hash', async () => {
    orderRepo.findWithItems.mockImplementation(async () => baseOrder);

    await expect(
      handler.execute(
        new MarkShippedCommand('order-1', 'seller-1', {
          carrier: 'FedEx',
          trackingNumber: 'TRACK-1',
        }),
      ),
    ).rejects.toEqual(
      RpcExceptionHelper.badRequest(
        'A valid blockchain shipment transaction hash is required.',
      ),
    );

    expect(orderRepo.update).not.toHaveBeenCalled();
  });

  it('marks non-blockchain orders shipped directly', async () => {
    const nonBlockchainOrder = {
      ...baseOrder,
      paymentMethod: OrderPaymentMethod.STRIPE,
      onChainOrderId: null,
    };
    orderRepo.findWithItems.mockImplementation(async () => nonBlockchainOrder);
    orderRepo.update.mockImplementation(
      async (_id, patch: Record<string, unknown>) => ({
        ...nonBlockchainOrder,
        ...patch,
      }),
    );

    await handler.execute(
      new MarkShippedCommand('order-1', 'seller-1', {
        carrier: 'DHL',
        trackingNumber: 'TRACK-2',
        shippingMethod: 'Express',
      }),
    );

    expect(orderRepo.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        status: OrderStatus.SHIPPED,
        escrowState: EscrowState.SHIPPED,
        carrier: 'DHL',
        trackingNumber: 'TRACK-2',
        shippingMethod: 'Express',
      }),
    );
  });
});
