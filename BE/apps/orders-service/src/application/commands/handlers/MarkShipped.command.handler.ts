import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  RpcExceptionHelper,
  OrderStatus,
  EscrowState,
} from '@app/common';
import { MarkShippedCommand } from '../MarkShipped.command';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';
import { isValidTransition } from '../../../domain/constants';

@CommandHandler(MarkShippedCommand)
export class MarkShippedHandler implements ICommandHandler<MarkShippedCommand> {
  private readonly logger = new Logger(MarkShippedHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: MarkShippedCommand): Promise<Order | null> {
    try {
      const { orderId, data } = command;
      this.logger.log(`Marking order as shipped: ${orderId}`);

      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      if (!isValidTransition(order.status, OrderStatus.SHIPPED)) {
        throw RpcExceptionHelper.badRequest(
          `Cannot mark order as shipped in status '${order.status}'. Order must be in ESCROW_HELD status.`,
        );
      }

      return this.orderRepo.update(orderId, {
        status: OrderStatus.SHIPPED,
        shippedAt: new Date(),
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        shippingMethod: data.shippingMethod || null,
        escrowState: EscrowState.SHIPPED,
      });
    } catch (error) {
      this.logger.error(`Failed to mark order as shipped`, error.stack);
      if (error instanceof RpcException) throw error;
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
