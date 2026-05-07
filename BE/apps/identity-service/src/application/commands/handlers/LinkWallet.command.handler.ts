import { Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RpcExceptionHelper } from '@app/common';
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
export class LinkWalletHandler
  implements ICommandHandler<LinkWalletCommand, LinkWalletResult>
{
  private readonly logger = new Logger(LinkWalletHandler.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly walletSignatureService: WalletSignatureService,
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

      const updatedUser = await this.userRepository.update(userId, {
        walletAddress: normalizedAddress,
      });
      if (!updatedUser) {
        throw RpcExceptionHelper.notFound('Failed to update wallet');
      }

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
