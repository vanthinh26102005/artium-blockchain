import { RpcExceptionHelper, TransactionStatus } from '@app/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { HttpException, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import { PaymentTransaction } from '../../../../domain/entities/payment-transaction.entity';
import { PaymentRefundedEvent } from '../../../../domain/events';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces/payment-transaction.repository.interface';
import { IStripeCustomerRepository } from '../../../../domain/interfaces/stripe-customer.repository.interface';
import { StripeService } from '../../../../infrastructure/services/stripe.service';
import { CreateStripeRefundCommand } from '../CreateStripeRefund.command';

@CommandHandler(CreateStripeRefundCommand)
export class CreateStripeRefundHandler implements ICommandHandler<CreateStripeRefundCommand> {
  private readonly logger = new Logger(CreateStripeRefundHandler.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    @Inject(IStripeCustomerRepository)
    private readonly stripeCustomerRepo: IStripeCustomerRepository,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(
    command: CreateStripeRefundCommand,
  ): Promise<PaymentTransaction> {
    const { data } = command;

    this.logger.log(
      `Creating Stripe refund for payment intent: ${data.paymentIntentId}`,
    );

    try {
      const transaction = await this.transactionRepo.findById(
        data.transactionId,
      );

      if (!transaction) {
        throw RpcExceptionHelper.notFound(
          `Transaction not found: ${data.transactionId}`,
        );
      }

      if (transaction.stripePaymentIntentId !== data.paymentIntentId) {
        throw RpcExceptionHelper.badRequest(
          'Payment intent ID does not match transaction',
        );
      }

      if (transaction.status !== TransactionStatus.SUCCEEDED) {
        throw RpcExceptionHelper.badRequest(
          'Can only refund succeeded transactions',
        );
      }

      // Verify the original payer has a Stripe customer record
      const stripeCustomer = await this.stripeCustomerRepo.findByUserId(
        transaction.userId,
      );
      if (!stripeCustomer) {
        throw RpcExceptionHelper.badRequest(
          'Cannot process refund: original payer does not have a valid Stripe customer record.',
        );
      }

      const refundAmount = data.amount || transaction.amount;

      if (refundAmount > transaction.amount) {
        throw RpcExceptionHelper.badRequest(
          'Refund amount cannot exceed original transaction amount',
        );
      }

      const metadata: Record<string, string> = {
        transactionId: data.transactionId,
        ...data.metadata,
      };

      const refund = await this.stripeService.createRefund(
        data.paymentIntentId,
        refundAmount,
        data.reason as any,
        metadata,
      );

      const isPartialRefund = refundAmount < transaction.amount;
      const newStatus = isPartialRefund
        ? TransactionStatus.PARTIALLY_REFUNDED
        : TransactionStatus.REFUNDED;

      const updatedTransaction = await this.transactionRepo.update(
        transaction.id,
        {
          status: newStatus,
          refundAmount: refundAmount,
          refundReason: data.reason || null,
          refundedAt: new Date(),
        },
      );

      const event = new PaymentRefundedEvent(
        transaction.id,
        transaction.userId,
        data.paymentIntentId,
        refundAmount,
        transaction.currency,
        isPartialRefund,
        data.reason,
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
        `Stripe refund created successfully: ${refund.id}, amount: ${refundAmount}`,
      );
      this.logger.log(
        `PaymentRefundedEvent published for transaction: ${transaction.id}`,
      );
      return updatedTransaction!;
    } catch (error) {
      this.logger.error('Failed to create Stripe refund', error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
