import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import {
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
  PaymentProvider,
} from '@app/common';
import { IOrderRepository } from '../../domain/interfaces';
import { Order } from '../../domain/entities';

type PaymentSucceededMessage = {
  transactionId: string;
  userId?: string;
  amount?: number;
  currency?: string;
  provider?: PaymentProvider;
  orderId?: string;
  stripePaymentIntentId?: string | null;
  txHash?: string | null;
};

@Injectable()
export class PaymentEventHandler {
  private readonly logger = new Logger(PaymentEventHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.PAYMENT_EVENTS,
    routingKey: RoutingKey.PAYMENT_SUCCEEDED,
    queue: 'orders-service.payment.succeeded',
    queueOptions: { durable: true },
  })
  async handlePaymentSucceeded(message: PaymentSucceededMessage) {
    if (!message.orderId) {
      return;
    }

    const order = await this.orderRepo.findById(message.orderId);
    if (!order) {
      this.logger.warn(
        `Order not found for successful payment transaction ${message.transactionId}`,
      );
      return;
    }

    if (
      order.paymentTransactionId &&
      order.paymentTransactionId !== message.transactionId
    ) {
      this.logger.warn(
        `Payment transaction ${message.transactionId} does not match order's paymentTransactionId ` +
          `(${order.paymentTransactionId || 'none'}). Skipping update.`,
      );
      return;
    }

    // Validate the order belongs to a collector (buyer)
    if (!order.collectorId) {
      this.logger.warn(
        `Order ${order.id} has no collector (buyer) assigned. Cannot verify payment ownership.`,
      );
      return;
    }

    if (!this.isPaymentEventValidForOrder(order, message)) {
      return;
    }

    const paymentMethod =
      message.provider === PaymentProvider.ETHEREUM
        ? OrderPaymentMethod.BLOCKCHAIN
        : OrderPaymentMethod.STRIPE;

    await this.orderRepo.update(order.id, {
      paymentTransactionId: message.transactionId,
      paymentMethod,
      paymentStatus: OrderPaymentStatus.PAID,
      paymentIntentId: message.stripePaymentIntentId ?? order.paymentIntentId,
      txHash: message.txHash ?? order.txHash,
      confirmedAt: order.confirmedAt ?? new Date(),
      status: this.getStatusAfterPaymentSuccess(order.status),
    });

    this.logger.log(
      `Order ${order.id} updated from payment success ${message.transactionId}`,
    );
  }

  private isPaymentEventValidForOrder(
    order: Order,
    message: PaymentSucceededMessage,
  ): boolean {
    if (!message.provider) {
      this.logger.warn(
        `Payment success ${message.transactionId} missing provider for order ${order.id}`,
      );
      return false;
    }

    if (
      message.provider !== PaymentProvider.STRIPE &&
      message.provider !== PaymentProvider.ETHEREUM
    ) {
      this.logger.warn(
        `Payment success ${message.transactionId} has unsupported provider ${message.provider}`,
      );
      return false;
    }

    if (!message.userId || message.userId !== order.collectorId) {
      this.logger.warn(
        `Payment success ${message.transactionId} user does not match order ${order.id} collector`,
      );
      return false;
    }

    if (
      !message.currency ||
      message.currency.toUpperCase() !== order.currency.toUpperCase()
    ) {
      this.logger.warn(
        `Payment success ${message.transactionId} currency does not match order ${order.id}`,
      );
      return false;
    }

    if (!this.paymentAmountMatchesOrder(order, message)) {
      this.logger.warn(
        `Payment success ${message.transactionId} amount does not match order ${order.id}`,
      );
      return false;
    }

    return true;
  }

  private paymentAmountMatchesOrder(
    order: Order,
    message: PaymentSucceededMessage,
  ): boolean {
    const paidAmount = Number(message.amount);
    const orderTotal = Number(order.totalAmount);

    if (!Number.isFinite(paidAmount) || !Number.isFinite(orderTotal)) {
      return false;
    }

    if (message.provider === PaymentProvider.STRIPE) {
      return Math.round(paidAmount) === Math.round(orderTotal * 100);
    }

    return Math.round(paidAmount * 100) === Math.round(orderTotal * 100);
  }

  private getStatusAfterPaymentSuccess(
    currentStatus: OrderStatus,
  ): OrderStatus {
    if (
      currentStatus === OrderStatus.PENDING ||
      currentStatus === OrderStatus.CONFIRMED
    ) {
      return OrderStatus.PROCESSING;
    }

    return currentStatus;
  }
}
