import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, OrderStatus } from '@app/common';
import { OpenDisputeCommand } from '../OpenDispute.command';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';
import { isValidTransition } from '../../../domain/constants';

/** Maximum number of days after shipment that a dispute can be opened. */
const DISPUTE_WINDOW_DAYS = 14;

@CommandHandler(OpenDisputeCommand)
export class OpenDisputeHandler implements ICommandHandler<OpenDisputeCommand> {
  private readonly logger = new Logger(OpenDisputeHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: OpenDisputeCommand): Promise<Order | null> {
    try {
      const { orderId, dto } = command;
      this.logger.log(`Opening dispute for order: ${orderId}`);

      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      if (!isValidTransition(order.status, OrderStatus.DISPUTE_OPEN)) {
        throw RpcExceptionHelper.badRequest(
          `Cannot open dispute in status '${order.status}'. Order must be in SHIPPED status.`,
        );
      }

      // Enforce the 14-day dispute window from shipment date
      if (order.shippedAt) {
        const deadlineMs = order.shippedAt.getTime() + DISPUTE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
        if (Date.now() > deadlineMs) {
          throw RpcExceptionHelper.badRequest(
            `Dispute window has expired. Disputes must be opened within ${DISPUTE_WINDOW_DAYS} days of shipment.`,
          );
        }
      }

      return this.orderRepo.update(orderId, {
        status: OrderStatus.DISPUTE_OPEN,
        disputeReason: dto.reason,
        disputeOpenedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to open dispute for order`, error.stack);
      if (error instanceof RpcException) throw error;
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
