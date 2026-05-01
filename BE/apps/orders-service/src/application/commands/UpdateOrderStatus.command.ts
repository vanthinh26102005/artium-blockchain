import { OrderStatus } from '@app/common';

export class UpdateOrderStatusCommand {
  constructor(
    public readonly orderId: string,
    public readonly status: OrderStatus,
    public readonly metadata?: Record<string, any>,
  ) {}
}
