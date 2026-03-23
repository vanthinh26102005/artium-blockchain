import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, OrderStatus } from '@app/common';
import { UpdateOrderStatusCommand } from '../UpdateOrderStatus.command';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler
  implements ICommandHandler<UpdateOrderStatusCommand>
{
  private readonly logger = new Logger(UpdateOrderStatusHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: UpdateOrderStatusCommand): Promise<Order | null> {
    try {
      const { orderId, status, metadata } = command;
      this.logger.log(`Updating order ${orderId} to status: ${status}`);

      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      const updateData: Partial<Order> = { status };

      if (status === OrderStatus.SHIPPED) {
        updateData.shippedAt = new Date();
        if (metadata?.trackingNumber) {
          updateData.trackingNumber = metadata.trackingNumber;
        }
      } else if (status === OrderStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      } else if (status === OrderStatus.CANCELLED) {
        updateData.cancelledAt = new Date();
        if (metadata?.reason) {
          updateData.cancelledReason = metadata.reason;
        }
      }

      return this.orderRepo.update(orderId, updateData);
    } catch (error) {
      this.logger.error(`Failed to update order status`, error.stack);
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
