import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  RpcExceptionHelper,
  OrderStatus,
  EscrowState,
} from '@app/common';
import { ResolveDisputeCommand } from '../ResolveDispute.command';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';
import { isValidTransition } from '../../../domain/constants';

@CommandHandler(ResolveDisputeCommand)
export class ResolveDisputeHandler implements ICommandHandler<ResolveDisputeCommand> {
  private readonly logger = new Logger(ResolveDisputeHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: ResolveDisputeCommand): Promise<Order | null> {
    try {
      const { orderId, dto } = command;
      this.logger.log(`Resolving dispute for order: ${orderId} (favorBuyer=${dto.favorBuyer})`);

      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      const targetStatus = dto.favorBuyer
        ? OrderStatus.REFUNDED
        : OrderStatus.DELIVERED;

      if (!isValidTransition(order.status, targetStatus)) {
        throw RpcExceptionHelper.badRequest(
          `Cannot resolve dispute in status '${order.status}'. Order must be in DISPUTE_OPEN status.`,
        );
      }

      const escrowState = dto.favorBuyer
        ? EscrowState.REFUNDED
        : EscrowState.RELEASED;

      return this.orderRepo.update(orderId, {
        status: targetStatus,
        escrowState,
        disputeResolvedAt: new Date(),
        disputeResolutionNotes: dto.resolutionNotes || null,
      });
    } catch (error) {
      this.logger.error(`Failed to resolve dispute for order`, error.stack);
      if (error instanceof RpcException) throw error;
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
