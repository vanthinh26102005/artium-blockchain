import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, TransactionStatus } from '@app/common';
import { ProcessRefundCommand } from '../ProcessRefund.command';
import { PaymentTransaction } from '../../../../domain/entities';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces';

@CommandHandler(ProcessRefundCommand)
export class ProcessRefundHandler implements ICommandHandler<ProcessRefundCommand> {
  private readonly logger = new Logger(ProcessRefundHandler.name);

  constructor(
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
  ) {}

  async execute(command: ProcessRefundCommand): Promise<PaymentTransaction> {
    try {
      const { transactionId, refundAmount, refundReason } = command.data;
      this.logger.log(
        `Processing refund for transaction: ${transactionId}, amount: ${refundAmount}`,
      );

      // Get the transaction
      const transaction = await this.transactionRepo.findById(transactionId);
      if (!transaction) {
        throw RpcExceptionHelper.notFound(
          `Transaction with ID ${transactionId} not found`,
        );
      }

      // Validate transaction status
      if (transaction.status !== TransactionStatus.SUCCEEDED) {
        throw RpcExceptionHelper.badRequest(
          'Can only refund succeeded transactions',
        );
      }

      // Validate refund amount
      if (refundAmount <= 0 || refundAmount > Number(transaction.amount)) {
        throw RpcExceptionHelper.badRequest(
          `Refund amount must be between 0 and ${transaction.amount}`,
        );
      }

      // Record refund
      const result = await this.transactionRepo.recordRefund(
        transactionId,
        refundAmount,
        refundReason,
      );

      this.logger.log(
        `Refund processed successfully for transaction: ${transactionId}`,
      );

      return result!;
    } catch (error) {
      this.logger.error(`Failed to process refund`, error.stack);
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
