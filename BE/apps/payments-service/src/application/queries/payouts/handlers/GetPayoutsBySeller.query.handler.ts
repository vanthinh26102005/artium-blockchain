import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetPayoutsBySellerQuery } from '../GetPayoutsBySeller.query';
import { Payout } from '../../../../domain/entities';
import { IPayoutRepository } from '../../../../domain/interfaces';

@QueryHandler(GetPayoutsBySellerQuery)
export class GetPayoutsBySellerHandler implements IQueryHandler<GetPayoutsBySellerQuery> {
  private readonly logger = new Logger(GetPayoutsBySellerHandler.name);

  constructor(
    @Inject(IPayoutRepository)
    private readonly payoutRepo: IPayoutRepository,
  ) {}

  async execute(query: GetPayoutsBySellerQuery): Promise<Payout[]> {
    try {
      const { sellerId } = query;
      this.logger.log(`Getting payouts for seller: ${sellerId}`);

      return await this.payoutRepo.findBySellerId(sellerId);
    } catch (error) {
      this.logger.error(`Failed to get payouts for seller`, error.stack);
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
