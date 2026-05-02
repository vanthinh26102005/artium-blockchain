import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { OrderStatus } from '@app/common';
import { ACTIVE_ARTWORK_LOCK_ORDER_STATUSES } from '../../../infrastructure/repositories/order.repository';
import { GetArtworkOrderLocksQuery } from '../GetArtworkOrderLocks.query';
import { GetArtworkOrderLocksHandler } from './GetArtworkOrderLocks.query.handler';

describe('GetArtworkOrderLocksHandler', () => {
  const orderRepo = {
    findActiveArtworkLocks: jest.fn(),
  };

  let handler: GetArtworkOrderLocksHandler;

  beforeEach(() => {
    orderRepo.findActiveArtworkLocks = jest.fn();
    handler = new GetArtworkOrderLocksHandler(orderRepo as never);
  });

  it('passes seller and artwork IDs through unchanged', async () => {
    const sellerId = 'seller-1';
    const artworkIds = ['artwork-1', 'artwork-2'];
    orderRepo.findActiveArtworkLocks.mockResolvedValue(['artwork-2'] as never);

    await expect(
      handler.execute(new GetArtworkOrderLocksQuery(sellerId, artworkIds)),
    ).resolves.toEqual({ artworkIds: ['artwork-2'] });

    expect(orderRepo.findActiveArtworkLocks).toHaveBeenCalledWith(
      sellerId,
      artworkIds,
    );
  });

  it('documents active lock statuses and excludes terminal statuses', () => {
    expect(ACTIVE_ARTWORK_LOCK_ORDER_STATUSES).toEqual([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.AUCTION_ACTIVE,
      OrderStatus.ESCROW_HELD,
      OrderStatus.DISPUTE_OPEN,
    ]);
    expect(ACTIVE_ARTWORK_LOCK_ORDER_STATUSES).not.toContain(
      OrderStatus.DELIVERED,
    );
    expect(ACTIVE_ARTWORK_LOCK_ORDER_STATUSES).not.toContain(
      OrderStatus.CANCELLED,
    );
    expect(ACTIVE_ARTWORK_LOCK_ORDER_STATUSES).not.toContain(
      OrderStatus.REFUNDED,
    );
  });
});
