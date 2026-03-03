import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, TransactionStatus } from '@app/common';
import { CreatePaymentCommand } from '../CreatePayment.command';
import { PaymentTransaction } from '../../../../domain/entities';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  private readonly logger = new Logger(CreatePaymentHandler.name);

  constructor(
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<PaymentTransaction> {
    try {
      const { data } = command;
      this.logger.log(
        `Creating payment transaction for user: ${data.userId}, amount: ${data.amount}`,
      );

      // Validate amount
      if (data.amount <= 0) {
        throw RpcExceptionHelper.badRequest(
          'Payment amount must be greater than 0',
        );
      }

      // Calculate net amount (after platform fee)
      const platformFee = data.platformFee || 0;
      const netAmount = data.amount - platformFee;

      // Create payment transaction
      const transaction = await this.transactionRepo.create({
        type: data.type,
        status: TransactionStatus.PENDING,
        provider: data.provider,
        userId: data.userId,
        sellerId: data.sellerId,
        orderId: data.orderId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        currency: data.currency,
        platformFee,
        netAmount,
        paymentMethodId: data.paymentMethodId,
        paymentMethodType: data.paymentMethodType,
        description: data.description,
      });

      this.logger.log(`Payment transaction created: ${transaction.id}`);

      return transaction;
    } catch (error) {
      this.logger.error(`Failed to create payment transaction`, error.stack);
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
