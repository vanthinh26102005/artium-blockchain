import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreateStripePaymentIntentCommand } from '../CreateStripePaymentIntent.command';
import { StripeService } from '../../../../infrastructure/services/stripe.service';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces/payment-transaction.repository.interface';
import { IStripeCustomerRepository } from '../../../../domain/interfaces/stripe-customer.repository.interface';
import { PaymentTransaction } from '../../../../domain/entities/payment-transaction.entity';
import {
  PaymentProvider,
  TransactionStatus,
  TransactionType,
  RpcExceptionHelper,
} from '@app/common';
import { ITransactionService } from '@app/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { PaymentIntentCreatedEvent } from '../../../../domain/events';

@CommandHandler(CreateStripePaymentIntentCommand)
export class CreateStripePaymentIntentHandler implements ICommandHandler<CreateStripePaymentIntentCommand> {
  private readonly logger = new Logger(CreateStripePaymentIntentHandler.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    @Inject(IStripeCustomerRepository)
    private readonly stripeCustomerRepo: IStripeCustomerRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(
    command: CreateStripePaymentIntentCommand,
  ): Promise<PaymentTransaction> {
    const { data } = command;

    this.logger.log(
      `Creating Stripe payment intent for user: ${data.userId}, amount: ${data.amount} ${data.currency}`,
    );

    if (data.amount <= 0) {
      throw RpcExceptionHelper.badRequest(
        'Payment amount must be greater than 0',
      );
    }

    if (data.currency.length !== 3) {
      throw RpcExceptionHelper.badRequest(
        'Currency must be a 3-letter ISO code',
      );
    }

    // Verify user has a Stripe customer
    const stripeCustomer = await this.stripeCustomerRepo.findByUserId(
      data.userId,
    );
    if (!stripeCustomer) {
      throw RpcExceptionHelper.badRequest(
        'User must register as a Stripe customer before making payments. Please call create_stripe_customer first.',
      );
    }

    try {
      const metadata: Record<string, string> = {
        userId: data.userId,
        ...(data.orderId && { orderId: data.orderId }),
        ...(data.invoiceId && { invoiceId: data.invoiceId }),
        ...(data.sellerId && { sellerId: data.sellerId }),
        ...data.metadata,
      };

      const paymentIntent = await this.stripeService.createPaymentIntent(
        data.amount,
        data.currency,
        metadata,
        stripeCustomer.stripeId, // Always use the verified Stripe customer ID
        data.stripePaymentMethodId,
        data.description,
      );

      const platformFee = data.amount * 0.05;
      const netAmount = data.amount - platformFee;

      const transaction = await this.transactionService.execute(
        async (manager) => {
          const newTransaction = await this.transactionRepo.create(
            {
              type: TransactionType.PAYMENT,
              status: TransactionStatus.PENDING,
              provider: PaymentProvider.STRIPE,
              userId: data.userId,
              sellerId: data.sellerId || null,
              orderId: data.orderId || null,
              invoiceId: data.invoiceId || null,
              amount: data.amount,
              currency: data.currency.toUpperCase(),
              platformFee,
              netAmount,
              stripePaymentIntentId: paymentIntent.id,
              description: data.description || null,
              metadata: data.metadata || null,
            },
            manager,
          );

          const event = new PaymentIntentCreatedEvent(
            newTransaction.id,
            data.userId,
            paymentIntent.id,
            data.amount,
            data.currency,
            data.orderId,
            data.invoiceId,
          );

          await this.outboxService.createOutboxMessage(
            {
              aggregateType: 'PaymentTransaction',
              aggregateId: newTransaction.id,
              eventType: PaymentIntentCreatedEvent.getEventType(),
              payload: event.toPayload(),
              exchange: ExchangeName.PAYMENT_EVENTS,
              routingKey: RoutingKey.PAYMENT_INTENT_CREATED,
            },
            manager,
          );

          return newTransaction;
        },
      );

      this.logger.log(
        `Stripe payment intent created successfully: ${paymentIntent.id}, transaction: ${transaction.id}`,
      );
      return transaction;
    } catch (error) {
      this.logger.error('Failed to create Stripe payment intent', error.stack);
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
