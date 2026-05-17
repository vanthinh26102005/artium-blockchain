import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { ResetSellerAuctionStartAttemptCommand } from '../ResetSellerAuctionStartAttempt.command';
import {
  IAuctionStartAttemptRepository,
  IOrderRepository,
} from '../../../domain/interfaces';

@CommandHandler(ResetSellerAuctionStartAttemptCommand)
export class ResetSellerAuctionStartAttemptHandler
  implements ICommandHandler<ResetSellerAuctionStartAttemptCommand>
{
  private readonly logger = new Logger(ResetSellerAuctionStartAttemptHandler.name);

  constructor(
    @Inject(IAuctionStartAttemptRepository)
    private readonly startAttemptRepo: IAuctionStartAttemptRepository,
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: ResetSellerAuctionStartAttemptCommand) {
    try {
      const attempt = await this.startAttemptRepo.findById(command.attemptId);
      if (!attempt || attempt.sellerId !== command.sellerId) {
        throw RpcExceptionHelper.notFound('Auction start attempt not found');
      }

      const order = await this.orderRepo.findByOnChainOrderId(attempt.orderId);
      if (order) {
        throw RpcExceptionHelper.conflict(
          'This auction already has an order projection and cannot be reset from the start workspace.',
        );
      }

      if (attempt.txHash) {
        throw RpcExceptionHelper.conflict(
          'This auction has a submitted wallet transaction. Wait for blockchain sync before resetting it.',
        );
      }

      const deleted = await this.startAttemptRepo.delete(attempt.id);
      if (!deleted) {
        throw RpcExceptionHelper.internalError(
          'Failed to reset the auction start attempt.',
        );
      }

      return { reset: true, attemptId: attempt.id, artworkId: attempt.artworkId };
    } catch (error) {
      this.logger.error(
        'Failed to reset seller auction start attempt',
        (error as Error).stack,
      );
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError((error as Error).message);
    }
  }
}
