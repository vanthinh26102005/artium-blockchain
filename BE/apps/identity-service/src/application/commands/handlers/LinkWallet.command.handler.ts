import { Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ITransactionService, RpcExceptionHelper } from '@app/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { LinkWalletCommand } from '../LinkWallet.command';
import {
  IUserRepository,
  UserPayload,
  WalletSignatureService,
} from '../../../domain';

type LinkWalletResult = {
  user: UserPayload;
};

@CommandHandler(LinkWalletCommand)
export class LinkWalletHandler implements ICommandHandler<
  LinkWalletCommand,
  LinkWalletResult
> {
  private readonly logger = new Logger(LinkWalletHandler.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly walletSignatureService: WalletSignatureService,
    private readonly outboxService: OutboxService,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(command: LinkWalletCommand): Promise<LinkWalletResult> {
    try {
      const { userId, input } = command;
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw RpcExceptionHelper.notFound('User not found');
      }

      const normalizedAddress =
        await this.walletSignatureService.verifySignedMessage(
          input.message,
          input.signature,
        );

      const existingByWallet =
        await this.userRepository.findByWalletAddress(normalizedAddress);
      if (existingByWallet && existingByWallet.id !== userId) {
        throw RpcExceptionHelper.conflict(
          'Wallet address is already registered to another account.',
        );
      }

      const occurredAt = new Date();
      const previousWalletAddress = user.walletAddress?.trim().toLowerCase();
      const updatedUser = await this.transactionService.execute(
        async (manager) => {
          const nextUser = await this.userRepository.update(
            userId,
            {
              walletAddress: normalizedAddress,
            },
            manager,
          );
          if (!nextUser) {
            throw RpcExceptionHelper.notFound('Failed to update wallet');
          }

          if (
            previousWalletAddress &&
            previousWalletAddress !== normalizedAddress
          ) {
            await this.outboxService.createOutboxMessage(
              {
                aggregateType: 'user',
                aggregateId: userId,
                eventType: 'IdentityWalletUnlinked',
                exchange: ExchangeName.USER_EVENTS,
                routingKey: RoutingKey.IDENTITY_WALLET_UNLINKED,
                payload: {
                  userId,
                  walletAddress: previousWalletAddress,
                  occurredAt: occurredAt.toISOString(),
                },
              },
              manager,
            );
          }

          await this.outboxService.createOutboxMessage(
            {
              aggregateType: 'user',
              aggregateId: userId,
              eventType: 'IdentityWalletLinked',
              exchange: ExchangeName.USER_EVENTS,
              routingKey: RoutingKey.IDENTITY_WALLET_LINKED,
              payload: {
                userId,
                walletAddress: normalizedAddress,
                occurredAt: occurredAt.toISOString(),
              },
            },
            manager,
          );

          return nextUser;
        },
      );

      this.logger.log(`Linked wallet ${normalizedAddress} to user ${userId}`);

      const { password: _password, ...safeUser } = updatedUser;
      return { user: safeUser as UserPayload };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      if (error.code === '23505') {
        throw RpcExceptionHelper.conflict(
          'Wallet address is already registered to another account.',
        );
      }

      throw error;
    }
  }
}
