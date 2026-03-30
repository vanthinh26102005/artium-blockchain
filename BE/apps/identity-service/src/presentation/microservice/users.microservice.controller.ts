import {
  GetUserProfileDto,
  LoginGoogleDto,
  PasswordResetConfirmDto,
  PasswordResetRequestDto,
  PasswordResetVerifyDto,
  RegisterCompleteDto,
  RegisterInitiateDto,
} from '@app/common';
import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CompleteUserRegistrationCommand,
  ConfirmNewPasswordCommand,
  GetUserByIdQuery,
  GetWalletNonceQuery,
  InitiateUserRegistrationCommand,
  LoginByEmailCommand,
  LoginByGoogleCommand,
  LoginByWalletCommand,
  RequestPasswordResetCommand,
  VerifyPasswordResetCommand,
} from '../../application';
import {
  EmailLoginInput,
  LoginResponse,
  UserPayload,
  WalletLoginInput,
} from '../../domain';

@Controller()
export class UsersMicroserviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'get_user_profile' })
  async getUserProfile(
    @Payload() data: GetUserProfileDto,
  ): Promise<UserPayload> {
    const userId = data?.user?.id;
    if (!userId) {
      return data.user;
    }

    const user = await this.queryBus.execute(new GetUserByIdQuery(userId));
    if (!user) {
      return data.user;
    }

    const { password: _password, ...safeUser } = user;
    return safeUser as UserPayload;
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Payload() data: { userId: string }): Promise<UserPayload> {
    return this.queryBus.execute(new GetUserByIdQuery(data.userId));
  }

  @MessagePattern({ cmd: 'login_email' })
  async loginEmail(
    @Payload() loginInput: EmailLoginInput,
  ): Promise<LoginResponse> {
    return this.commandBus.execute(new LoginByEmailCommand(loginInput));
  }

  @MessagePattern({ cmd: 'login_google' })
  async loginGoogle(
    @Payload() loginInput: LoginGoogleDto,
  ): Promise<LoginResponse> {
    return this.commandBus.execute(new LoginByGoogleCommand(loginInput));
  }

  @MessagePattern({ cmd: 'initiate_registeration' })
  async initiateRegistration(
    @Payload() input: RegisterInitiateDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(new InitiateUserRegistrationCommand(input));
    return { success: true, message: 'OTP sent successfully' };
  }

  @MessagePattern({ cmd: 'complete_registeration' })
  async completeRegistration(
    @Payload() input: RegisterCompleteDto,
  ): Promise<LoginResponse> {
    return this.commandBus.execute(new CompleteUserRegistrationCommand(input));
  }

  @MessagePattern({ cmd: 'request_password_reset' })
  async requestPasswordReset(
    @Payload() input: PasswordResetRequestDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(new RequestPasswordResetCommand(input));
    return {
      success: true,
      message: 'If email exists, reset instructions will be sent',
    };
  }

  @MessagePattern({ cmd: 'password_reset_verify' })
  async verifyPasswordReset(
    @Payload() input: PasswordResetVerifyDto,
  ): Promise<{ valid: boolean }> {
    return this.queryBus.execute(new VerifyPasswordResetCommand(input));
  }

  @MessagePattern({ cmd: 'password_reset_confirm' })
  async confirmPasswordReset(
    @Payload() input: PasswordResetConfirmDto,
  ): Promise<LoginResponse> {
    return this.commandBus.execute(new ConfirmNewPasswordCommand(input));
  }

  @MessagePattern({ cmd: 'login_wallet' })
  async loginWallet(
    @Payload() input: WalletLoginInput,
  ): Promise<LoginResponse> {
    return this.commandBus.execute(new LoginByWalletCommand(input));
  }

  @MessagePattern({ cmd: 'get_wallet_nonce' })
  async getWalletNonce(
    @Payload() data: { address: string },
  ): Promise<{ nonce: string }> {
    return this.queryBus.execute(new GetWalletNonceQuery(data.address));
  }
}
