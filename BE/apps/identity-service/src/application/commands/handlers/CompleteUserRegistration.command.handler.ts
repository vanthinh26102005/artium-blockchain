import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateUserInput,
  OtpContext,
  OtpService,
  RegistrationService,
} from 'apps/identity-service/src/domain';
import { TokenService } from 'apps/identity-service/src/domain/services/token.service';
import { ITransactionService } from '@app/common';
import {
  CompleteUserRegistrationCommand,
  CompleteUserRegistrationResult,
} from '../CompleteUserRegistration.command';

@CommandHandler(CompleteUserRegistrationCommand)
export class CompleteUserRegistrationHandler implements ICommandHandler<
  CompleteUserRegistrationCommand,
  CompleteUserRegistrationResult
> {
  private readonly logger = new Logger(CompleteUserRegistrationHandler.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly registrationService: RegistrationService,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(
    command: CompleteUserRegistrationCommand,
  ): Promise<CompleteUserRegistrationResult> {
    const { email, otp } = command.input;
    this.logger.log(`Attempting to complete registration for email: ${email}`);

    try {
      const registrationPayload =
        await this.otpService.verifyOtp<CreateUserInput>(
          OtpContext.USER_REGISTRATION,
          email,
          otp,
        );
      this.logger.debug(`OTP verified successfully for email: ${email}`);

      const result = await this.transactionService.execute(async (manager) => {
        const newUser = await this.registrationService.createUser(
          registrationPayload,
          manager,
        );

        await this.otpService.invalidateOtp(
          OtpContext.USER_REGISTRATION,
          email,
        );
        this.logger.debug(`OTP invalidated for email: ${email}`);

        const tokenPair = await this.tokenService.generateTokenPair(newUser);
        this.logger.debug(
          `Token pair generated for new user ID: ${newUser.id}`,
        );

        return { user: newUser, ...tokenPair };
      });

      this.logger.log(
        `User registration completed successfully for email: ${email}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Registration completion failed for email=${email}`,
        error.stack,
      );

      throw error;
    }
  }
}
