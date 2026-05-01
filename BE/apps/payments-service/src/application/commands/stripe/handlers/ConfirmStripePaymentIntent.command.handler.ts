import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { ConfirmStripePaymentIntentCommand } from '../ConfirmStripePaymentIntent.command';
import { StripeService } from '../../../../infrastructure/services/stripe.service';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces/payment-transaction.repository.interface';
import { IStripeCustomerRepository } from '../../../../domain/interfaces/stripe-customer.repository.interface';
import { IInvoiceRepository } from '../../../../domain/interfaces';
import { PaymentTransaction } from '../../../../domain/entities/payment-transaction.entity';
import { TransactionStatus } from '@app/common';

@CommandHandler(ConfirmStripePaymentIntentCommand)
export class ConfirmStripePaymentIntentHandler implements ICommandHandler<ConfirmStripePaymentIntentCommand> {
  private readonly logger = new Logger(ConfirmStripePaymentIntentHandler.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    @Inject(IStripeCustomerRepository)
    private readonly stripeCustomerRepo: IStripeCustomerRepository,
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(
    command: ConfirmStripePaymentIntentCommand,
  ): Promise<PaymentTransaction> {
    const { data } = command;

    this.logger.log(
      `Confirming Stripe payment intent: ${data.paymentIntentId}`,
    );

    try {
      const paymentIntent = await this.stripeService.confirmPaymentIntent(
        data.paymentIntentId,
        data.stripePaymentMethodId,
        data.returnUrl,
      );

      const transaction =
        await this.transactionRepo.findByStripePaymentIntentId(
          data.paymentIntentId,
        );

      if (!transaction) {
        throw RpcExceptionHelper.notFound(
          `Transaction not found for payment intent: ${data.paymentIntentId}`,
        );
      }

      // Verify the payer has a Stripe customer record
      const stripeCustomer = await this.stripeCustomerRepo.findByUserId(
        transaction.userId,
      );
      if (!stripeCustomer) {
        throw RpcExceptionHelper.badRequest(
          'Cannot confirm payment: payer does not have a valid Stripe customer record.',
        );
      }

      const status =
        paymentIntent.status === 'succeeded'
          ? TransactionStatus.SUCCEEDED
          : paymentIntent.status === 'processing'
            ? TransactionStatus.PROCESSING
            : TransactionStatus.PENDING;

      const updatedTransaction = await this.transactionRepo.update(
        transaction.id,
        {
          status,
          stripeChargeId: (paymentIntent.latest_charge as string) || null,
          processedAt:
            paymentIntent.status === 'processing' ? new Date() : null,
          completedAt: paymentIntent.status === 'succeeded' ? new Date() : null,
        },
      );

      if (paymentIntent.status === 'succeeded') {
        if (transaction.invoiceId) {
          await this.invoiceRepo.markAsPaid(
            transaction.invoiceId,
            transaction.id,
          );
        }
      }

      this.logger.log(
        `Payment intent confirmed successfully: ${data.paymentIntentId}, status: ${status}`,
      );
      return updatedTransaction!;
    } catch (error) {
      this.logger.error('Failed to confirm Stripe payment intent', error.stack);
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
