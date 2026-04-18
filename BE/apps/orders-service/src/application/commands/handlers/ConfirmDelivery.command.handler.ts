import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  RpcExceptionHelper,
  OrderStatus,
  OrderPaymentStatus,
  EscrowState,
} from '@app/common';
import { ConfirmDeliveryCommand } from '../ConfirmDelivery.command';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';
import { isValidTransition } from '../../../domain/constants';

@CommandHandler(ConfirmDeliveryCommand)
export class ConfirmDeliveryHandler implements ICommandHandler<ConfirmDeliveryCommand> {
  private readonly logger = new Logger(ConfirmDeliveryHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: ConfirmDeliveryCommand): Promise<Order | null> {
    try {
      const { orderId, data } = command;
      this.logger.log(`Confirming delivery for order: ${orderId}`);

      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      if (!isValidTransition(order.status, OrderStatus.DELIVERED)) {
        throw RpcExceptionHelper.badRequest(
          `Cannot confirm delivery for order in status '${order.status}'. Order must be in SHIPPED status.`,
        );
      }

      const updateData: Partial<Order> = {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
        escrowState: EscrowState.COMPLETED,
        paymentStatus: OrderPaymentStatus.RELEASED,
      };

      if (data?.notes) {
        updateData.customerNotes = data.notes;
      }

      return this.orderRepo.update(orderId, updateData);
    } catch (error) {
      this.logger.error(`Failed to confirm delivery`, error.stack);
      if (error instanceof RpcException) throw error;
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
