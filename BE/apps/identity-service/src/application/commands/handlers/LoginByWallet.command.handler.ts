import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper, UserRole } from '@app/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ethers } from 'ethers';
import * as crypto from 'node:crypto';
import { LoginByWalletCommand } from '../LoginByWallet.command';
import {
  IUserRepository,
  LoginResponse,
  NonceService,
  TokenService,
} from 'apps/identity-service/src/domain';

@CommandHandler(LoginByWalletCommand)
export class LoginByWalletHandler
  implements ICommandHandler<LoginByWalletCommand, LoginResponse>
{
  private readonly logger = new Logger(LoginByWalletHandler.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly nonceService: NonceService,
  ) {}

  async execute(command: LoginByWalletCommand): Promise<LoginResponse> {
    const { message, signature } = command.input;

    const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
    if (!addressMatch) {
      throw RpcExceptionHelper.badRequest(
        'Invalid SIWE message: no Ethereum address found.',
      );
    }
    const parsedAddress = addressMatch[0];

    const nonceMatch = message.match(/Nonce:\s*(\S+)/);
    if (!nonceMatch) {
      throw RpcExceptionHelper.badRequest(
        'Invalid SIWE message: no nonce found.',
      );
    }
    const nonce = nonceMatch[1];

    const nonceValid = await this.nonceService.verifyAndConsumeNonce(
      parsedAddress,
      nonce,
    );
    if (!nonceValid) {
      throw RpcExceptionHelper.unauthorized('Invalid or expired nonce.');
    }

    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
    } catch {
      throw RpcExceptionHelper.unauthorized('Invalid signature.');
    }

    if (recoveredAddress.toLowerCase() !== parsedAddress.toLowerCase()) {
      throw RpcExceptionHelper.unauthorized(
        'Signature does not match the address in the message.',
      );
    }

    const normalizedAddress = parsedAddress.toLowerCase();

    let user = await this.userRepository.findByWalletAddress(normalizedAddress);

    if (!user) {
      try {
        user = await this.userRepository.create({
          email: `${normalizedAddress.slice(0, 10)}@wallet.local`,
          password: crypto.randomBytes(16).toString('hex'),
          fullName: null,
          avatarUrl: null,
          googleId: null,
          walletAddress: normalizedAddress,
          isEmailVerified: false,
          roles: [UserRole.COLLECTOR],
          isActive: true,
          stripeCustomerId: null,
          lastLogin: null,
        });

        this.logger.log(`Created new user ${user.id} via wallet login.`);
      } catch (error) {
        this.logger.error(
          `Failed to create user with wallet ${normalizedAddress}`,
          error.stack,
        );
        throw RpcExceptionHelper.badRequest(
          `Cannot create user with wallet ${normalizedAddress}`,
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
