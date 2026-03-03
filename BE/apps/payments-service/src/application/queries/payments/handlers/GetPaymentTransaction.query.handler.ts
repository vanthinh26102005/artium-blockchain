import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetPaymentTransactionQuery } from '../GetPaymentTransaction.query';
import { PaymentTransaction } from '../../../../domain/entities';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces';

@QueryHandler(GetPaymentTransactionQuery)
export class GetPaymentTransactionHandler implements IQueryHandler<GetPaymentTransactionQuery> {
  private readonly logger = new Logger(GetPaymentTransactionHandler.name);

  constructor(
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
  ) {}

  async execute(
    query: GetPaymentTransactionQuery,
  ): Promise<PaymentTransaction> {
    try {
      const { transactionId } = query;
      this.logger.log(`Getting payment transaction: ${transactionId}`);

      const transaction = await this.transactionRepo.findById(transactionId);
      if (!transaction) {
        throw RpcExceptionHelper.notFound(
          `Transaction with ID ${transactionId} not found`,
        );
      }

      return transaction;
    } catch (error) {
      this.logger.error(`Failed to get payment transaction`, error.stack);
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
