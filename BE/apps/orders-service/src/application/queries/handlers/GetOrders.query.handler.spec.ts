import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { OrderPaymentMethod, OrderStatus } from '@app/common';
import { GetOrdersQuery } from '../GetOrders.query';
import { GetOrdersHandler } from './GetOrders.query.handler';

describe('GetOrdersHandler', () => {
  const orderRepo = {
    findBySellerIdViaItems: jest.fn(),
    findByBuyerIdentity: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  let handler: GetOrdersHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new GetOrdersHandler(orderRepo as any);
  });

  it('lists buyer orders by app user id and winning auction wallet', async () => {
    orderRepo.findByBuyerIdentity.mockImplementation(async () => ({
      data: [],
      total: 0,
    }));

    await expect(
      handler.execute(
        new GetOrdersQuery({
          buyerId: 'buyer-1',
          buyerWallet: '0xWinner',
          status: OrderStatus.ESCROW_HELD,
          paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
          skip: 5,
          take: 10,
        } as any),
      ),
    ).resolves.toEqual({ data: [], total: 0 });

    expect(orderRepo.findByBuyerIdentity).toHaveBeenCalledWith({
      buyerId: 'buyer-1',
      buyerWallet: '0xWinner',
      skip: 5,
      take: 10,
      status: OrderStatus.ESCROW_HELD,
      onChainOrderId: undefined,
      escrowState: undefined,
      paymentMethod: OrderPaymentMethod.BLOCKCHAIN,
    });
    expect(orderRepo.find).not.toHaveBeenCalled();
    expect(orderRepo.count).not.toHaveBeenCalled();
  });
});
