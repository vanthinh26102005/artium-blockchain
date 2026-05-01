import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  RpcExceptionHelper,
  OrderStatus,
  OrderPaymentStatus,
  PayoutStatus,
} from '@app/common';
import { CreateOrderCommand } from '../CreateOrder.command';
import { Order } from '../../../domain/entities';
import {
  IOrderRepository,
  IOrderItemRepository,
} from '../../../domain/interfaces';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    @Inject(IOrderItemRepository)
    private readonly orderItemRepo: IOrderItemRepository,
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order | null> {
    try {
      const { data } = command;
      this.logger.log(`Creating order for buyer: ${data.buyerId}`);

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      let subtotal = 0;
      data.items.forEach((item) => {
        subtotal += item.price * item.quantity;
      });
      const shippingCost = data.shippingCost ?? 0;

      const order = await this.orderRepo.create({
        collectorId: data.buyerId,
        orderNumber,
        status: OrderStatus.PENDING,
        subtotal,
        totalAmount: subtotal + shippingCost,
        shippingCost,
        taxAmount: 0,
        currency: 'USD',
        paymentStatus: OrderPaymentStatus.UNPAID,
        shippingAddress: data.shippingAddress || null,
        customerNotes: data.notes,
      });

      for (const item of data.items) {
        await this.orderItemRepo.create({
          orderId: order.id,
          artworkId: item.artworkId,
          sellerId: data.sellerId,
          priceAtPurchase: item.price,
          quantity: item.quantity,
          currency: 'USD',
          artworkTitle: item.artworkTitle?.trim() || 'Artwork',
          artworkImageUrl: item.artworkImageUrl?.trim() || null,
          payoutStatus: PayoutStatus.PENDING,
        });
      }

      this.logger.log(`Order created: ${order.id}, number: ${orderNumber}`);
      return this.orderRepo.findById(order.id);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create order';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Failed to create order`, errorStack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(errorMessage);
    }
  }
}
