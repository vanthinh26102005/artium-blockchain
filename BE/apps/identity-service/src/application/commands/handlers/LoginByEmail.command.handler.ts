import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import * as bcrypt from 'bcryptjs';
import {
  IUserRepository,
  AuthAbuseProtectionService,
  LoginResponse,
  TokenService,
} from 'apps/identity-service/src/domain';
import { LoginByEmailCommand } from '../LoginByEmail.command';

@CommandHandler(LoginByEmailCommand)
export class LoginByEmailHandler implements ICommandHandler<
  LoginByEmailCommand,
  LoginResponse
> {
  private readonly logger = new Logger(LoginByEmailHandler.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly authAbuseProtectionService: AuthAbuseProtectionService,
  ) {}

  async execute(command: LoginByEmailCommand): Promise<LoginResponse> {
    try {
      const { email, password } = command.loginInput;

      if (!email || !password) {
        throw RpcExceptionHelper.badRequest('Email and password are required');
      }

      await this.authAbuseProtectionService.assertCanAttemptEmailLogin(
        command.loginInput,
        command.metadata,
      );

      this.logger.debug(`Attempting login for email: ${email}`);

      const user = await this.userRepository.findByEmail(email);
      if (!user || !user.password) {
        this.logger.warn(
          `Login failed for email: ${email} - User not found or missing password`,
        );
        await this.authAbuseProtectionService.recordEmailLoginFailure(
          email,
          command.metadata,
        );
        throw RpcExceptionHelper.unauthorized('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Login failed for email: ${email} - Invalid password`);
        await this.authAbuseProtectionService.recordEmailLoginFailure(
          email,
          command.metadata,
        );
        throw RpcExceptionHelper.unauthorized('Invalid credentials');
      }

      await this.authAbuseProtectionService.recordEmailLoginSuccess(
        email,
        command.metadata,
      );

      const tokenPair = await this.tokenService.generateTokenPair(
        user,
        command.metadata?.userAgent,
        command.metadata?.ipAddress,
      );

      await this.userRepository.updateLastLogin(user.id, new Date());

      this.logger.log(`Login successful for userId: ${user.id}`);
      return { user, ...tokenPair };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);

      if (error instanceof RpcException) {
        throw error;
      }

      throw RpcExceptionHelper.badRequest('Authentication failed');
    }
  }
}
