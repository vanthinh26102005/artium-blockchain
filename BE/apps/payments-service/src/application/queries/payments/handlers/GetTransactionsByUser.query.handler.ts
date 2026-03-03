import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetTransactionsByUserQuery } from '../GetTransactionsByUser.query';
import { PaymentTransaction } from '../../../../domain/entities';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces';

@QueryHandler(GetTransactionsByUserQuery)
export class GetTransactionsByUserHandler implements IQueryHandler<GetTransactionsByUserQuery> {
  private readonly logger = new Logger(GetTransactionsByUserHandler.name);

  constructor(
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
  ) {}

  async execute(
    query: GetTransactionsByUserQuery,
  ): Promise<PaymentTransaction[]> {
    try {
      const { userId } = query;
      this.logger.log(`Getting transactions for user: ${userId}`);

      return await this.transactionRepo.findByUserId(userId);
    } catch (error) {
      this.logger.error(`Failed to get transactions for user`, error.stack);
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
