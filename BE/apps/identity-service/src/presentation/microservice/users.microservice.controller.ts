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
import { RpcException } from '@nestjs/microservices';
import {
  CompleteUserRegistrationCommand,
  ConfirmNewPasswordCommand,
  GetUserByIdQuery,
  GetUserBySlugQuery,
  GetWalletNonceQuery,
  InitiateUserRegistrationCommand,
  LoginByEmailCommand,
  LoginByGoogleCommand,
  LoginByWalletCommand,
  RequestPasswordResetCommand,
  UpdateUserProfileCommand,
  VerifyPasswordResetCommand,
} from '../../application';
import {
  EmailLoginInput,
  LoginResponse,
  UserPayload,
  VerifyPasswordResetResponse,
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
      throw new RpcException({ statusCode: 401, message: 'User ID is required' });
    }

    const user = await this.queryBus.execute(new GetUserByIdQuery(userId));
    if (!user) {
      throw new RpcException({ statusCode: 404, message: `User with ID ${userId} not found` });
    }

    const { password: _password, ...safeUser } = user;
    return safeUser as UserPayload;
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Payload() data: { userId: string }): Promise<UserPayload> {
    return this.queryBus.execute(new GetUserByIdQuery(data.userId));
  }

  @MessagePattern({ cmd: 'get_user_by_slug' })
  async getUserBySlug(@Payload() data: { slug: string }): Promise<UserPayload> {
    const user = await this.queryBus.execute(new GetUserBySlugQuery(data.slug));
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: `User with slug '${data.slug}' not found`,
      });
    }
    const { password: _password, ...safeUser } = user;
    return safeUser as UserPayload;
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
  ): Promise<VerifyPasswordResetResponse> {
    return this.commandBus.execute(new VerifyPasswordResetCommand(input));
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

  @MessagePattern({ cmd: 'update_user_profile' })
  async updateUserProfile(
    @Payload() data: { userId: string; input: Record<string, unknown> },
  ): Promise<{ success: boolean; message: string; user: UserPayload }> {
    const result = await this.commandBus.execute(
      new UpdateUserProfileCommand(data.userId, data.input),
    );
    return {
      success: true,
      message: 'User profile updated successfully',
      user: result.user as UserPayload,
    };
  }
}
