import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetPayoutQuery } from '../GetPayout.query';
import { Payout } from '../../../../domain/entities';
import { IPayoutRepository } from '../../../../domain/interfaces';

@QueryHandler(GetPayoutQuery)
export class GetPayoutHandler implements IQueryHandler<GetPayoutQuery> {
  private readonly logger = new Logger(GetPayoutHandler.name);

  constructor(
    @Inject(IPayoutRepository)
    private readonly payoutRepo: IPayoutRepository,
  ) {}

  async execute(query: GetPayoutQuery): Promise<Payout> {
    try {
      const { payoutId } = query;
      this.logger.log(`Getting payout: ${payoutId}`);

      const payout = await this.payoutRepo.findById(payoutId);
      if (!payout) {
        throw RpcExceptionHelper.notFound(
          `Payout with ID ${payoutId} not found`,
        );
      }

      return payout;
    } catch (error) {
      this.logger.error(`Failed to get payout`, error.stack);
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
