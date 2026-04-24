import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import {
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
  PaymentProvider,
} from '@app/common';
import { IOrderRepository } from '../../domain/interfaces';

type PaymentSucceededMessage = {
  transactionId: string;
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
      status: order.status === OrderStatus.PENDING ? OrderStatus.CONFIRMED : order.status,
    });

    this.logger.log(
      `Order ${order.id} updated from payment success ${message.transactionId}`,
    );
  }
}
