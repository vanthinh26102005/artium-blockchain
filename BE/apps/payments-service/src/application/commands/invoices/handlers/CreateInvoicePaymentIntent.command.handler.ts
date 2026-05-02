import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  InvoiceStatus,
  PaymentProvider,
  RpcExceptionHelper,
  TransactionStatus,
  TransactionType,
  ITransactionService,
  PLATFORM_FEE_RATE,
} from '@app/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { StripeService } from '../../../../infrastructure/services/stripe.service';
import {
  IInvoiceRepository,
  IPaymentTransactionRepository,
  IStripeCustomerRepository,
} from '../../../../domain/interfaces';
import { PaymentIntentCreatedEvent } from '../../../../domain/events';
import { CreateInvoicePaymentIntentCommand } from '../CreateInvoicePaymentIntent.command';

type CreateInvoicePaymentIntentResult = {
  transactionId: string;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
};

const trimOrUndefined = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

@CommandHandler(CreateInvoicePaymentIntentCommand)
export class CreateInvoicePaymentIntentHandler implements ICommandHandler<CreateInvoicePaymentIntentCommand> {
  private readonly logger = new Logger(CreateInvoicePaymentIntentHandler.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    @Inject(IStripeCustomerRepository)
    private readonly stripeCustomerRepo: IStripeCustomerRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(
    command: CreateInvoicePaymentIntentCommand,
  ): Promise<CreateInvoicePaymentIntentResult> {
    const { invoiceId, invoiceNumber, userId, buyerEmail, buyerName } =
      command.data;

    if (!userId || userId.trim() === '') {
      throw RpcExceptionHelper.badRequest('userId is required');
    }

    if (!invoiceId && !invoiceNumber) {
      throw RpcExceptionHelper.badRequest(
        'invoiceId or invoiceNumber is required',
      );
    }

    const invoice = invoiceId
      ? await this.invoiceRepo.findById(invoiceId)
      : await this.invoiceRepo.findByInvoiceNumber(invoiceNumber as string);

    if (!invoice) {
      throw RpcExceptionHelper.notFound('Invoice not found');
    }

    if (
      invoice.status === InvoiceStatus.PAID ||
      invoice.status === InvoiceStatus.CANCELLED
    ) {
      throw RpcExceptionHelper.badRequest(
        'Invoice is already paid or cancelled',
      );
    }

    const resolvedEmail =
      trimOrUndefined(buyerEmail) ||
      trimOrUndefined(invoice.customerEmail || undefined);
    if (!resolvedEmail) {
      throw RpcExceptionHelper.badRequest('buyerEmail is required');
    }

    const amount = toNumber(invoice.totalAmount);
    if (amount <= 0) {
      throw RpcExceptionHelper.badRequest(
        'Invoice total amount must be greater than 0',
      );
    }

    const currency = (invoice.currency || 'USD').toLowerCase();

    try {
      let stripeCustomer = await this.stripeCustomerRepo.findByUserId(userId);
      if (!stripeCustomer) {
        const customer = await this.stripeService.createCustomer(
          resolvedEmail,
          trimOrUndefined(buyerName),
          {
            userId,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber || '',
          },
        );

        stripeCustomer = await this.stripeCustomerRepo.create({
          userId,
          stripeId: customer.id,
          email: customer.email!,
          name: customer.name || null,
          isActive: true,
        });
      }

      const metadata: Record<string, string> = {
        userId,
        sellerId: invoice.sellerId,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber || '',
      };

      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        currency,
        metadata,
        stripeCustomer.stripeId,
        undefined,
        `Invoice ${invoice.invoiceNumber || invoice.id}`,
      );

      if (!paymentIntent.client_secret) {
        throw RpcExceptionHelper.internalError(
          'Stripe did not return a client secret',
        );
      }

      const platformFee = amount * PLATFORM_FEE_RATE;
      const netAmount = amount - platformFee;

      const transaction = await this.transactionService.execute(
        async (manager) => {
          const newTransaction = await this.transactionRepo.create(
            {
              type: TransactionType.PAYMENT,
              status: TransactionStatus.PENDING,
              provider: PaymentProvider.STRIPE,
              userId,
              sellerId: invoice.sellerId,
              invoiceId: invoice.id,
              amount,
              currency: currency.toUpperCase(),
              platformFee,
              netAmount,
              stripePaymentIntentId: paymentIntent.id,
              description: `Payment for invoice ${invoice.invoiceNumber || invoice.id}`,
              metadata,
            },
            manager,
          );

          if (!invoice.collectorId || invoice.customerEmail !== resolvedEmail) {
            await this.invoiceRepo.update(
              invoice.id,
              {
                collectorId: invoice.collectorId || userId,
                customerEmail: resolvedEmail,
              },
              manager,
            );
          }

          const event = new PaymentIntentCreatedEvent(
            newTransaction.id,
            userId,
            paymentIntent.id,
            amount,
            currency,
            undefined,
            invoice.id,
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
        `Invoice payment intent created: ${paymentIntent.id} (transaction ${transaction.id})`,
      );

      return {
        transactionId: transaction.id,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
      };
    } catch (error) {
      this.logger.error('Failed to create invoice payment intent', error.stack);
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
