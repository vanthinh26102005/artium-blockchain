import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginByWalletCommand } from '../LoginByWallet.command';
import {
  IUserRepository,
  LoginResponse,
  TokenService,
  WalletSignatureService,
} from 'apps/identity-service/src/domain';

@CommandHandler(LoginByWalletCommand)
export class LoginByWalletHandler implements ICommandHandler<
  LoginByWalletCommand,
  LoginResponse
> {
  private readonly logger = new Logger(LoginByWalletHandler.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly walletSignatureService: WalletSignatureService,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: LoginByWalletCommand): Promise<LoginResponse> {
    const { message, signature } = command.input;
    const normalizedAddress =
      await this.walletSignatureService.verifySignedMessage(message, signature);

    const user =
      await this.userRepository.findByWalletAddress(normalizedAddress);

    if (!user) {
      throw RpcExceptionHelper.notFound('Wallet_Not_Registered');
    }

    const occurredAt = new Date();
    await this.outboxService.createOutboxMessage({
      aggregateType: 'user',
      aggregateId: user.id,
      eventType: 'IdentityWalletLinked',
      exchange: ExchangeName.USER_EVENTS,
      routingKey: RoutingKey.IDENTITY_WALLET_LINKED,
      payload: {
        userId: user.id,
        walletAddress: normalizedAddress,
        occurredAt: occurredAt.toISOString(),
      },
    });

    const tokenPair = await this.tokenService.generateTokenPair(
      user,
      command.metadata?.userAgent,
      command.metadata?.ipAddress,
    );

    return {
      user,
      ...tokenPair,
    };
  }
}
