import {
  AuthRequestMetadata,
  AuthRpcPayload,
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
  LinkWalletCommand,
  LoginByEmailCommand,
  LoginByGoogleCommand,
  LoginByWalletCommand,
  RequestPasswordResetCommand,
  UnlinkWalletCommand,
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

type MaybeAuthPayload<T> = T | AuthRpcPayload<T>;

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
      throw new RpcException({
        statusCode: 401,
        message: 'User ID is required',
      });
    }

    const user = await this.queryBus.execute(new GetUserByIdQuery(userId));
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: `User with ID ${userId} not found`,
      });
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
    @Payload() payload: MaybeAuthPayload<EmailLoginInput>,
  ): Promise<LoginResponse> {
    const { input, meta } = this.unpackAuthPayload(payload);
    return this.commandBus.execute(new LoginByEmailCommand(input, meta));
  }

  @MessagePattern({ cmd: 'login_google' })
  async loginGoogle(
    @Payload() payload: MaybeAuthPayload<LoginGoogleDto>,
  ): Promise<LoginResponse> {
    const { input, meta } = this.unpackAuthPayload(payload);
    return this.commandBus.execute(new LoginByGoogleCommand(input, meta));
  }

  @MessagePattern({ cmd: 'initiate_registeration' })
  async initiateRegistration(
    @Payload() payload: MaybeAuthPayload<RegisterInitiateDto>,
  ): Promise<{ success: boolean; message: string }> {
    const { input, meta } = this.unpackAuthPayload(payload);
    await this.commandBus.execute(
      new InitiateUserRegistrationCommand(input, meta),
    );
    return { success: true, message: 'OTP sent successfully' };
  }

  @MessagePattern({ cmd: 'complete_registeration' })
  async completeRegistration(
    @Payload() payload: MaybeAuthPayload<RegisterCompleteDto>,
  ): Promise<LoginResponse> {
    const { input, meta } = this.unpackAuthPayload(payload);
    return this.commandBus.execute(
      new CompleteUserRegistrationCommand(input, meta),
    );
  }

  @MessagePattern({ cmd: 'request_password_reset' })
  async requestPasswordReset(
    @Payload() payload: MaybeAuthPayload<PasswordResetRequestDto>,
  ): Promise<{ success: boolean; message: string }> {
    const { input, meta } = this.unpackAuthPayload(payload);
    await this.commandBus.execute(new RequestPasswordResetCommand(input, meta));
    return {
      success: true,
      message: 'If email exists, reset instructions will be sent',
    };
  }

  @MessagePattern({ cmd: 'password_reset_verify' })
  async verifyPasswordReset(
    @Payload() payload: MaybeAuthPayload<PasswordResetVerifyDto>,
  ): Promise<VerifyPasswordResetResponse> {
    const { input } = this.unpackAuthPayload(payload);
    return this.commandBus.execute(new VerifyPasswordResetCommand(input));
  }

  @MessagePattern({ cmd: 'password_reset_confirm' })
  async confirmPasswordReset(
    @Payload() payload: MaybeAuthPayload<PasswordResetConfirmDto>,
  ): Promise<LoginResponse> {
    const { input, meta } = this.unpackAuthPayload(payload);
    return this.commandBus.execute(new ConfirmNewPasswordCommand(input, meta));
  }

  @MessagePattern({ cmd: 'login_wallet' })
  async loginWallet(
    @Payload() payload: MaybeAuthPayload<WalletLoginInput>,
  ): Promise<LoginResponse> {
    const { input, meta } = this.unpackAuthPayload(payload);
    return this.commandBus.execute(new LoginByWalletCommand(input, meta));
  }

  @MessagePattern({ cmd: 'get_wallet_nonce' })
  async getWalletNonce(
    @Payload() data: { address: string },
  ): Promise<{ nonce: string }> {
    return this.queryBus.execute(new GetWalletNonceQuery(data.address));
  }

  @MessagePattern({ cmd: 'link_wallet' })
  async linkWallet(
    @Payload() data: { userId: string; input: WalletLoginInput },
  ): Promise<{ success: boolean; message: string; user: UserPayload }> {
    const result = await this.commandBus.execute(
      new LinkWalletCommand(data.userId, data.input),
    );
    return {
      success: true,
      message: 'Wallet linked successfully',
      user: result.user as UserPayload,
    };
  }

  @MessagePattern({ cmd: 'unlink_wallet' })
  async unlinkWallet(
    @Payload() data: { userId: string },
  ): Promise<{ success: boolean; message: string; user: UserPayload }> {
    const result = await this.commandBus.execute(
      new UnlinkWalletCommand(data.userId),
    );
    return {
      success: true,
      message: 'Wallet disconnected successfully',
      user: result.user as UserPayload,
    };
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

  private unpackAuthPayload<T>(payload: MaybeAuthPayload<T>): {
    input: T;
    meta?: AuthRequestMetadata;
  } {
    if (
      payload &&
      typeof payload === 'object' &&
      'input' in payload &&
      Object.prototype.hasOwnProperty.call(payload, 'input')
    ) {
      const wrappedPayload = payload as AuthRpcPayload<T>;
      return { input: wrappedPayload.input, meta: wrappedPayload.meta };
    }

    return { input: payload as T };
  }
}
