import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, OrderStatus } from '@app/common';
import { CancelOrderCommand } from '../CancelOrder.command';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  private readonly logger = new Logger(CancelOrderHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: CancelOrderCommand): Promise<Order | null> {
    try {
      const { orderId, reason } = command;
      this.logger.log(`Cancelling order: ${orderId}`);

      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      if (order.status === OrderStatus.DELIVERED) {
        throw RpcExceptionHelper.badRequest('Cannot cancel a delivered order');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw RpcExceptionHelper.badRequest('Order is already cancelled');
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
