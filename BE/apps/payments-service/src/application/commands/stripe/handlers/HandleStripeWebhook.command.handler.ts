import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { HandleStripeWebhookCommand } from '../HandleStripeWebhook.command';
import { StripeService } from '../../../../infrastructure/services/stripe.service';
import {
  IPaymentTransactionRepository,
  IInvoiceRepository,
} from '../../../../domain/interfaces';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import {
  PaymentProvider,
  RpcExceptionHelper,
  TransactionStatus,
} from '@app/common';
import {
  PaymentSucceededEvent,
  PaymentFailedEvent,
} from '../../../../domain/events';

@CommandHandler(HandleStripeWebhookCommand)
export class HandleStripeWebhookHandler implements ICommandHandler<HandleStripeWebhookCommand> {
  private readonly logger = new Logger(HandleStripeWebhookHandler.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(
    command: HandleStripeWebhookCommand,
  ): Promise<{ received: boolean }> {
    const { data } = command;
    let event: any;

    try {
      event = await this.stripeService.constructWebhookEvent(
        data.body,
        data.signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err.message);
      throw RpcExceptionHelper.badRequest('Invalid webhook signature');
    }

    this.logger.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled webhook event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: any,
  ): Promise<void> {
    const transaction = await this.transactionRepo.findByStripePaymentIntentId(
      paymentIntent.id,
    );
    if (!transaction) {
      this.logger.warn(
        `No transaction found for payment intent: ${paymentIntent.id}`,
      );
      return;
    }
    if (transaction.status === TransactionStatus.SUCCEEDED) {
      this.logger.debug(
        `Transaction ${transaction.id} already succeeded — idempotent skip`,
      );
      return;
    }

    await this.transactionRepo.update(transaction.id, {
      status: TransactionStatus.SUCCEEDED,
      stripeChargeId: paymentIntent.latest_charge ?? null,
      processedAt: new Date(),
      completedAt: new Date(),
    });

    if (transaction.invoiceId) {
      await this.invoiceRepo.markAsPaid(transaction.invoiceId, transaction.id);
    }

    const event = new PaymentSucceededEvent({
      transactionId: transaction.id,
      userId: transaction.userId,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      provider: PaymentProvider.STRIPE,
      orderId: transaction.orderId ?? undefined,
      invoiceId: transaction.invoiceId ?? undefined,
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: paymentIntent.latest_charge ?? null,
    });

    await this.outboxService.createOutboxMessage({
      aggregateType: 'PaymentTransaction',
      aggregateId: transaction.id,
      eventType: PaymentSucceededEvent.getEventType(),
      payload: event.toPayload(),
      exchange: ExchangeName.PAYMENT_EVENTS,
      routingKey: RoutingKey.PAYMENT_SUCCEEDED,
    });

    this.logger.log(
      `PaymentSucceeded (webhook) published for transaction: ${transaction.id}`,
    );
  }

  private async handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
    const transaction = await this.transactionRepo.findByStripePaymentIntentId(
      paymentIntent.id,
    );
    if (!transaction) {
      this.logger.warn(
        `No transaction found for payment intent: ${paymentIntent.id}`,
      );
      return;
    }

    const failureReason =
      paymentIntent.last_payment_error?.message ?? 'Payment failed';
    const failureCode = paymentIntent.last_payment_error?.code ?? null;

    await this.transactionRepo.update(transaction.id, {
      status: TransactionStatus.FAILED,
      failureReason,
      failureCode,
    });

    const event = new PaymentFailedEvent({
      transactionId: transaction.id,
      userId: transaction.userId,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      provider: PaymentProvider.STRIPE,
      orderId: transaction.orderId ?? undefined,
      stripePaymentIntentId: paymentIntent.id,
      failureReason,
      failureCode: failureCode ?? undefined,
    });

    await this.outboxService.createOutboxMessage({
      aggregateType: 'PaymentTransaction',
      aggregateId: transaction.id,
      eventType: PaymentFailedEvent.getEventType(),
      payload: event.toPayload(),
      exchange: ExchangeName.PAYMENT_EVENTS,
      routingKey: RoutingKey.PAYMENT_FAILED,
    });

    this.logger.log(
      `PaymentFailed (webhook) published for transaction: ${transaction.id}`,
    );
  }
}
