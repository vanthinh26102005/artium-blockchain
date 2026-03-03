import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, PayoutStatus } from '@app/common';
import { ProcessPayoutCommand } from '../ProcessPayout.command';
import { Payout } from '../../../../domain/entities';
import { IPayoutRepository } from '../../../../domain/interfaces';

@CommandHandler(ProcessPayoutCommand)
export class ProcessPayoutHandler implements ICommandHandler<ProcessPayoutCommand> {
  private readonly logger = new Logger(ProcessPayoutHandler.name);

  constructor(
    @Inject(IPayoutRepository)
    private readonly payoutRepo: IPayoutRepository,
  ) {}

  async execute(command: ProcessPayoutCommand): Promise<Payout> {
    try {
      const { payoutId } = command;
      this.logger.log(`Processing payout: ${payoutId}`);

      // Get the payout
      const payout = await this.payoutRepo.findById(payoutId);
      if (!payout) {
        throw RpcExceptionHelper.notFound(
          `Payout with ID ${payoutId} not found`,
        );
      }

      // Validate payout status
      if (payout.status !== PayoutStatus.PENDING) {
        throw RpcExceptionHelper.badRequest(
          `Cannot process payout with status: ${payout.status}`,
        );
      }

      // Mark as processing (actual provider integration would go here)
      const result = await this.payoutRepo.markAsProcessed(payoutId);

      this.logger.log(`Payout marked as processing: ${payoutId}`);

      return result!;
    } catch (error) {
      this.logger.error(`Failed to process payout`, error.stack);
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
