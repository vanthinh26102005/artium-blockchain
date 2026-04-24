import { TransactionStatus } from '@app/common';
import { PaymentProvider } from '@app/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import {
  BadRequestException,
  Controller,
  Headers,
  Inject,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  PaymentFailedEvent,
  PaymentRefundedEvent,
  PaymentSucceededEvent,
} from '../../../domain/events';
import { IInvoiceRepository } from '../../../domain/interfaces';
import { IPaymentTransactionRepository } from '../../../domain/interfaces/payment-transaction.repository.interface';
import { StripeService } from '../../../infrastructure/services/stripe.service';

@ApiTags('stripe-webhooks')
@Controller('stripe/webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    private readonly outboxService: OutboxService,
  ) {
    this.webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    if (!this.webhookSecret) {
      this.logger.warn(
        'STRIPE_WEBHOOK_SECRET is not configured. Webhook verification will fail.',
      );
    }
  }

  @Post()
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    this.logger.log('Received Stripe webhook event');

    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    if (!this.webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new BadRequestException('Missing request body');
      }

      const event = await this.stripeService.constructWebhookEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );

      this.logger.log(
        `Processing webhook event: ${event.type}, ID: ${event.id}`,
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as any);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as any);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object as any);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as any);
          break;

        case 'customer.created':
          this.logger.log(`Customer created: ${event.data.object['id']}`);
          break;

        case 'payment_method.attached':
          this.logger.log(
            `Payment method attached: ${event.data.object['id']}`,
          );
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Failed to process webhook', error.stack);
      throw new BadRequestException(
        `Webhook processing failed: ${error.message}`,
      );
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);

    try {
      const transaction =
        await this.transactionRepo.findByStripePaymentIntentId(
          paymentIntent.id,
        );

      if (!transaction) {
        this.logger.warn(
          `Transaction not found for payment intent: ${paymentIntent.id}`,
        );
        return;
      }

      await this.transactionRepo.update(transaction.id, {
        status: TransactionStatus.SUCCEEDED,
        stripeChargeId: paymentIntent.latest_charge || null,
        processedAt: new Date(),
        completedAt: new Date(),
      });

      if (transaction.invoiceId) {
        await this.invoiceRepo.markAsPaid(
          transaction.invoiceId,
          transaction.id,
        );
      }

      const event = new PaymentSucceededEvent({
        transactionId: transaction.id,
        userId: transaction.userId,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        provider: PaymentProvider.STRIPE,
        orderId: transaction.orderId || undefined,
        invoiceId: transaction.invoiceId || undefined,
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.latest_charge || null,
      });

      await this.outboxService.createOutboxMessage({
        aggregateType: 'PaymentTransaction',
        aggregateId: transaction.id,
        eventType: PaymentSucceededEvent.getEventType(),
        payload: event.toPayload(),
        exchange: ExchangeName.PAYMENT_EVENTS,
        routingKey: RoutingKey.PAYMENT_SUCCEEDED,
      });

      this.logger.log(`Transaction updated to SUCCEEDED: ${transaction.id}`);
    } catch (error) {
      this.logger.error(
        'Failed to handle payment_intent.succeeded',
        error.stack,
      );
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: any) {
    this.logger.log(`Payment intent failed: ${paymentIntent.id}`);

    try {
      const transaction =
        await this.transactionRepo.findByStripePaymentIntentId(
          paymentIntent.id,
        );

      if (!transaction) {
        this.logger.warn(
          `Transaction not found for payment intent: ${paymentIntent.id}`,
        );
        return;
      }

      await this.transactionRepo.update(transaction.id, {
        status: TransactionStatus.FAILED,
        failureReason:
          paymentIntent.last_payment_error?.message || 'Payment failed',
        failureCode: paymentIntent.last_payment_error?.code || null,
      });

      const event = new PaymentFailedEvent({
        transactionId: transaction.id,
        userId: transaction.userId,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        provider: PaymentProvider.STRIPE,
        orderId: transaction.orderId || undefined,
        stripePaymentIntentId: paymentIntent.id,
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        failureCode: paymentIntent.last_payment_error?.code,
      });

      await this.outboxService.createOutboxMessage({
        aggregateType: 'PaymentTransaction',
        aggregateId: transaction.id,
        eventType: PaymentFailedEvent.getEventType(),
        payload: event.toPayload(),
        exchange: ExchangeName.PAYMENT_EVENTS,
        routingKey: RoutingKey.PAYMENT_FAILED,
      });

      this.logger.log(`Transaction updated to FAILED: ${transaction.id}`);
    } catch (error) {
      this.logger.error(
        'Failed to handle payment_intent.payment_failed',
        error.stack,
      );
    }
  }

  private async handlePaymentIntentCanceled(paymentIntent: any) {
    this.logger.log(`Payment intent canceled: ${paymentIntent.id}`);

    try {
      const transaction =
        await this.transactionRepo.findByStripePaymentIntentId(
          paymentIntent.id,
        );

      if (!transaction) {
        this.logger.warn(
          `Transaction not found for payment intent: ${paymentIntent.id}`,
        );
        return;
      }

      await this.transactionRepo.update(transaction.id, {
        status: TransactionStatus.CANCELLED,
      });

      this.logger.log(`Transaction updated to CANCELLED: ${transaction.id}`);
    } catch (error) {
      this.logger.error(
        'Failed to handle payment_intent.canceled',
        error.stack,
      );
    }
  }

  private async handleChargeRefunded(charge: any) {
    this.logger.log(`Charge refunded: ${charge.id}`);

    try {
      const transaction = await this.transactionRepo.findByStripeChargeId(
        charge.id,
      );

      if (!transaction) {
        this.logger.warn(`Transaction not found for charge: ${charge.id}`);
        return;
      }

      const refundAmount = charge.amount_refunded / 100;
      const isFullRefund = charge.refunded;

      await this.transactionRepo.update(transaction.id, {
        status: isFullRefund
          ? TransactionStatus.REFUNDED
          : TransactionStatus.PARTIALLY_REFUNDED,
        refundAmount,
        refundedAt: new Date(),
      });

      const event = new PaymentRefundedEvent(
        transaction.id,
        transaction.userId,
        transaction.stripePaymentIntentId!,
        refundAmount,
        transaction.currency,
        !isFullRefund,
      );

      await this.outboxService.createOutboxMessage({
        aggregateType: 'PaymentTransaction',
        aggregateId: transaction.id,
        eventType: PaymentRefundedEvent.getEventType(),
        payload: event.toPayload(),
        exchange: ExchangeName.PAYMENT_EVENTS,
        routingKey: RoutingKey.PAYMENT_REFUNDED,
      });

      this.logger.log(
        `Transaction updated to ${isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED'}: ${transaction.id}`,
      );
    } catch (error) {
      this.logger.error('Failed to handle charge.refunded', error.stack);
    }
  }
}
