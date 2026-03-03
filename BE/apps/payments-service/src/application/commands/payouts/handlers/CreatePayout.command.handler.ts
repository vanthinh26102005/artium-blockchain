import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper, PayoutStatus } from '@app/common';
import { CreatePayoutCommand } from '../CreatePayout.command';
import { Payout } from '../../../../domain/entities';
import { IPayoutRepository } from '../../../../domain/interfaces';

@CommandHandler(CreatePayoutCommand)
export class CreatePayoutHandler implements ICommandHandler<CreatePayoutCommand> {
  private readonly logger = new Logger(CreatePayoutHandler.name);

  constructor(
    @Inject(IPayoutRepository)
    private readonly payoutRepo: IPayoutRepository,
  ) {}

  async execute(command: CreatePayoutCommand): Promise<Payout> {
    try {
      const { data } = command;
      this.logger.log(
        `Creating payout for seller: ${data.sellerId}, amount: ${data.amount}`,
      );

      // Validate amount
      if (data.amount <= 0) {
        throw RpcExceptionHelper.badRequest(
          'Payout amount must be greater than 0',
        );
      }

      // Calculate net amount (after transaction fee)
      const transactionFee = data.transactionFee || 0;
      const netAmount = data.amount - transactionFee;

      if (netAmount <= 0) {
        throw RpcExceptionHelper.badRequest(
          'Net payout amount must be greater than 0',
        );
      }

      // Create payout
      const payout = await this.payoutRepo.create({
        sellerId: data.sellerId,
        status: PayoutStatus.PENDING,
        provider: data.provider,
        amount: data.amount,
        currency: data.currency,
        transactionFee,
        netAmount,
        transactionIds: data.transactionIds,
        description: data.description,
        scheduledAt: data.scheduledAt || new Date(),
      });

      this.logger.log(`Payout created successfully: ${payout.id}`);

      return payout;
    } catch (error) {
      this.logger.error(`Failed to create payout`, error.stack);
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
