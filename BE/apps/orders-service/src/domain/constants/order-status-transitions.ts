import { OrderStatus } from '@app/common';

/**
 * Defines valid order status transitions for the blockchain auction lifecycle.
 * Each key is a current status; its value is the set of statuses it can transition to.
 */
export const ORDER_STATUS_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  [OrderStatus.PENDING]: [
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
    OrderStatus.AUCTION_ACTIVE,
  ],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.PROCESSING,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PROCESSING]: [
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.AUCTION_ACTIVE]: [
    OrderStatus.ESCROW_HELD,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.ESCROW_HELD]: [
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
  ],
  [OrderStatus.SHIPPED]: [
    OrderStatus.DELIVERED,
    OrderStatus.DISPUTE_OPEN,
  ],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.DISPUTE_OPEN]: [
    OrderStatus.DELIVERED,
    OrderStatus.REFUNDED,
  ],
};

export function isValidTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
): boolean {
  const allowed = ORDER_STATUS_TRANSITIONS[currentStatus];
  return allowed?.includes(targetStatus) ?? false;
}
