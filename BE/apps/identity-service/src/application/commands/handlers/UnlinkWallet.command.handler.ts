import { Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RpcExceptionHelper } from '@app/common';
import { UnlinkWalletCommand } from '../UnlinkWallet.command';
import { IUserRepository, UserPayload } from '../../../domain';

type UnlinkWalletResult = {
  user: UserPayload;
};

@CommandHandler(UnlinkWalletCommand)
export class UnlinkWalletHandler
  implements ICommandHandler<UnlinkWalletCommand, UnlinkWalletResult>
{
  private readonly logger = new Logger(UnlinkWalletHandler.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UnlinkWalletCommand): Promise<UnlinkWalletResult> {
    try {
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw RpcExceptionHelper.notFound('User not found');
      }

      const updatedUser = await this.userRepository.update(command.userId, {
        walletAddress: null,
      });
      if (!updatedUser) {
        throw RpcExceptionHelper.notFound('Failed to update wallet');
      }

      this.logger.log(`Unlinked wallet from user ${command.userId}`);

      const { password: _password, ...safeUser } = updatedUser;
      return { user: safeUser as UserPayload };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw error;
    }
  }
}
