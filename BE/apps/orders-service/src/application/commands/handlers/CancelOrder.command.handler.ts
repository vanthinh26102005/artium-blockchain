import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, OrderStatus } from '@app/common';
import { CancelOrderCommand } from '../CancelOrder.command';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';
import { isValidTransition } from '../../../domain/constants';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  private readonly logger = new Logger(CancelOrderHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: CancelOrderCommand): Promise<Order | null> {
    try {
      const { orderId, userId, reason } = command;
      this.logger.log(`Cancelling order: ${orderId} by user: ${userId}`);

      const order = await this.orderRepo.findWithItems(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      // Buyer (collectorId) or seller (via items) can cancel
      const isBuyer = order.collectorId === userId;
      const isSeller =
        order.items?.some((item) => item.sellerId === userId) ?? false;
      if (!isBuyer && !isSeller) {
        throw RpcExceptionHelper.forbidden(
          'Only the buyer or seller of this order can cancel it.',
        );
      }

      if (!isValidTransition(order.status, OrderStatus.CANCELLED)) {
        throw RpcExceptionHelper.badRequest(
          `Cannot cancel order in status '${order.status}'.`,
        );
      }

      return this.orderRepo.update(orderId, {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledReason: reason || null,
      });
    } catch (error) {
      this.logger.error(`Failed to cancel order`, error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
