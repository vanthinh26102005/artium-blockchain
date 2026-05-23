import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  RpcExceptionHelper,
  OrderStatus,
  EscrowState,
  OrderPaymentMethod,
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

  private isBlockchainEscrowOrder(order: Order) {
    return (
      order.paymentMethod === OrderPaymentMethod.BLOCKCHAIN ||
      Boolean(order.onChainOrderId)
    );
  }

  private assertTransactionHash(transactionHash?: string) {
    if (!transactionHash || !/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
      throw RpcExceptionHelper.badRequest(
        'A valid blockchain shipment transaction hash is required.',
      );
    }
  }

  async execute(command: MarkShippedCommand): Promise<Order | null> {
    try {
      const { orderId, userId, data } = command;
      this.logger.log(
        `Marking order as shipped: ${orderId} by user: ${userId}`,
      );

      const order = await this.orderRepo.findWithItems(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      // Only the seller can mark as shipped
      const isSeller =
        order.items?.some((item) => item.sellerId === userId) ?? false;
      if (!isSeller) {
        throw RpcExceptionHelper.forbidden(
          'Only the seller of this order can mark it as shipped.',
        );
      }

      if (!isValidTransition(order.status, OrderStatus.SHIPPED)) {
        throw RpcExceptionHelper.badRequest(
          `Cannot mark order as shipped in status '${order.status}'. Order must be in ESCROW_HELD status.`,
        );
      }

      if (this.isBlockchainEscrowOrder(order)) {
        this.assertTransactionHash(data.transactionHash);

        return this.orderRepo.update(orderId, {
          carrier: data.carrier,
          trackingNumber: data.trackingNumber,
          shippingMethod: data.shippingMethod || null,
          txHash: data.transactionHash,
        });
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
