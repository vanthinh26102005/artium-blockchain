import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IUserRepository,
  LoginResponse,
  OtpContext,
  OtpService,
  TokenService,
} from 'apps/identity-service/src/domain';
import * as bcrypt from 'bcryptjs';
import { ITransactionService, RpcExceptionHelper } from '@app/common';
import { ConfirmNewPasswordCommand } from '../ConfirmNewPassword.command';

@CommandHandler(ConfirmNewPasswordCommand)
export class ConfirmNewPasswordHandler implements ICommandHandler<
  ConfirmNewPasswordCommand,
  LoginResponse
> {
  private readonly logger = new Logger(ConfirmNewPasswordHandler.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(command: ConfirmNewPasswordCommand): Promise<LoginResponse> {
    return this.transactionService.execute(async (manager) => {
      const { email, resetToken, newPassword } = command.input;
      this.logger.log(`Confirming new password for: ${email}`);

      const { userId } = await this.otpService.verifyAndConsumeOneTimeToken<{
        userId: string;
      }>(OtpContext.PASSWORD_RESET, email, resetToken);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await this.userRepository.update(
        userId,
        { password: hashedPassword },
        manager,
      );
      if (!updatedUser) {
        this.logger.warn(
          `User with ID ${userId} not found when resetting password.`,
        );
        throw RpcExceptionHelper.notFound(`User with ID ${userId} not found.`);
      }

      this.logger.log(
        `Password for user ${updatedUser.id} has been reset successfully.`,
      );

      const tokenPair = await this.tokenService.generateTokenPair(updatedUser);
      return { user: updatedUser, ...tokenPair };
    });
  }
}
