import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OAuth2Client } from 'google-auth-library';
import * as crypto from 'node:crypto';
import { LoginByGoogleCommand } from '../LoginByGoogle.command';
import {
  IUserRepository,
  LoginResponse,
  TokenService,
} from 'apps/identity-service/src/domain';
import { UserRole } from '@app/common';

export const GOOGLE_OAUTH2_CLIENT = 'GOOGLE_OAUTH2_CLIENT';

@CommandHandler(LoginByGoogleCommand)
export class LoginByGoogleHandler implements ICommandHandler<
  LoginByGoogleCommand,
  LoginResponse
> {
  private readonly logger = new Logger(LoginByGoogleHandler.name);

  constructor(
    @Inject(GOOGLE_OAUTH2_CLIENT) private readonly googleClient: OAuth2Client,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginByGoogleCommand): Promise<LoginResponse> {
    const { idToken } = command.input;

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw RpcExceptionHelper.unauthorized(
        'Invalid Google token or email not provided.',
      );
    }

    const {
      email,
      name: fullName,
      picture: avatarUrl,
      sub: googleId,
    } = payload;

    if (!email)
      throw RpcExceptionHelper.badRequest(
        'Email là bắt buộc cho Google login.',
      );

    let user = await this.userRepository.findByEmail(email);

    if (user) {
      const updateInput = {
        googleId: googleId,
        avatarUrl: avatarUrl || user.avatarUrl,
        isEmailVerified: true,
      };

      try {
        const updatedUser = await this.userRepository.update(
          user.id,
          updateInput,
        );
        if (!updatedUser) {
          this.logger.warn(
            `Failed to update user with ID ${user.id}: user not found.`,
          );
          throw RpcExceptionHelper.badRequest(`Cannot update user ${user.id}`);
        }
        this.logger.log(`Updated user ${user.id} with Google info.`);
      } catch (error) {
        this.logger.error(
          `Error updating user ${user.id} with Google info`,
          error.stack,
        );
        throw RpcExceptionHelper.badRequest(`Failed to update user ${user.id}`);
      }
    } else {
      try {
        const randomPassword = crypto.randomBytes(16).toString('hex');

        user = await this.userRepository.create({
          email,
          avatarUrl: avatarUrl ?? null,
          fullName: fullName ?? null,
          googleId,
          password: randomPassword,
          isEmailVerified: true,
          roles: [UserRole.COLLECTOR],
          isActive: true,
          stripeCustomerId: null,
          lastLogin: null,
        });

        this.logger.log(`Created new user ${user.id} via Google login.`);
      } catch (error) {
        this.logger.error(
          `Failed to create user with email ${email} via Google login`,
          error.stack,
        );
        throw RpcExceptionHelper.badRequest(
          `Cannot create user with email ${email}`,
        );
      }
    }

    const tokenPair = await this.tokenService.generateTokenPair(user);

    return {
      user,
      ...tokenPair,
    };
  }
}
