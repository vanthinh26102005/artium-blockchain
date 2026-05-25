import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  RpcExceptionHelper,
  OrderStatus,
  OrderPaymentStatus,
  EscrowState,
  OrderPaymentMethod,
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

  private normalizeWallet(value?: string | null) {
    return typeof value === 'string' && value.trim().length > 0
      ? value.trim().toLowerCase()
      : null;
  }

  private isBlockchainEscrowOrder(order: Order) {
    return (
      order.paymentMethod === OrderPaymentMethod.BLOCKCHAIN ||
      Boolean(order.onChainOrderId)
    );
  }

  async execute(command: ConfirmDeliveryCommand): Promise<Order | null> {
    try {
      const { orderId, userId, userWalletAddress, data } = command;
      this.logger.log(
        `Confirming delivery for order: ${orderId} by user: ${userId}`,
      );

      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      const isBlockchainOrder = this.isBlockchainEscrowOrder(order);
      const normalizedUserWallet = this.normalizeWallet(userWalletAddress);
      const normalizedBuyerWallet = this.normalizeWallet(order.buyerWallet);
      const isCollectorBuyer = order.collectorId === userId;
      const isWalletBuyer =
        isBlockchainOrder &&
        normalizedUserWallet !== null &&
        normalizedBuyerWallet === normalizedUserWallet;

      if (isBlockchainOrder ? !isWalletBuyer : !isCollectorBuyer) {
        throw RpcExceptionHelper.forbidden(
          'Only the buyer of this order can confirm delivery.',
        );
      }

      if (!isValidTransition(order.status, OrderStatus.DELIVERED)) {
        throw RpcExceptionHelper.badRequest(
          `Cannot confirm delivery for order in status '${order.status}'. Order must be in SHIPPED status.`,
        );
      }

      if (isBlockchainOrder) {
        const updateData: Partial<Order> = {
          deliveryConfirmedBy: userId,
          deliveryConfirmationMethod: data?.confirmationMethod ?? 'wallet',
          deliveryConfirmationNotes: data?.notes?.trim() || null,
          deliverySignatureDataUrl: data?.signatureDataUrl ?? null,
          deliveryConfirmationTxHash: data?.transactionHash ?? null,
          deliveryConfirmationSubmittedAt: new Date(),
        };

        return this.orderRepo.update(orderId, updateData);
      }

      if (!data?.signatureDataUrl) {
        throw RpcExceptionHelper.badRequest(
          'Delivery signature is required to confirm this order.',
        );
      }

      const updateData: Partial<Order> = {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
        deliveryConfirmedBy: userId,
        deliveryConfirmationMethod: data?.confirmationMethod ?? 'app',
        deliveryConfirmationNotes: data?.notes?.trim() || null,
        deliverySignatureDataUrl: data?.signatureDataUrl ?? null,
        deliveryConfirmationSubmittedAt: new Date(),
        ...(order.escrowState !== null && order.escrowState !== undefined
          ? { escrowState: EscrowState.COMPLETED }
          : {}),
        ...(order.paymentStatus === OrderPaymentStatus.ESCROW
          ? { paymentStatus: OrderPaymentStatus.RELEASED }
          : {}),
      };

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
