import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetPaymentMethodsQuery } from '../GetPaymentMethods.query';
import { PaymentMethod } from '../../../../domain/entities';
import { IPaymentMethodRepository } from '../../../../domain/interfaces';

@QueryHandler(GetPaymentMethodsQuery)
export class GetPaymentMethodsHandler implements IQueryHandler<GetPaymentMethodsQuery> {
  private readonly logger = new Logger(GetPaymentMethodsHandler.name);

  constructor(
    @Inject(IPaymentMethodRepository)
    private readonly paymentMethodRepo: IPaymentMethodRepository,
  ) {}

  async execute(query: GetPaymentMethodsQuery): Promise<PaymentMethod[]> {
    try {
      const { userId } = query;
      this.logger.log(`Getting payment methods for user: ${userId}`);

      return await this.paymentMethodRepo.findActiveByUserId(userId);
    } catch (error) {
      this.logger.error(`Failed to get payment methods`, error.stack);
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
