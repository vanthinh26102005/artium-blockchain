import { UserRole } from '@app/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { IRefreshTokenRepository } from '../interfaces/refresh-token.repository.interface';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { UserPayload } from '../dtos/payload';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async generateTokenPair(
    user: UserPayload,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    this.logger.log(`Generating token pair for userId=${user.id}`);
    const accessToken = this._generateAccessToken(user.id, user.roles);
    const refreshToken = await this._generateRefreshToken(
      user,
      deviceInfo,
      ipAddress,
    );
    return { accessToken, refreshToken };
  }

  async refreshTokens(
    oldRefreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const redisKey = this._getRedisKey(oldRefreshToken);
    const cached = await this.cacheManager.get<string>(redisKey);

    if (!cached) {
      this.logger.warn(`Refresh token not found in Redis: ${oldRefreshToken}`);
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const { userId, expiresAt } = JSON.parse(cached);

    if (new Date(expiresAt) < new Date()) {
      this.logger.warn(`Refresh token expired for userId=${userId}`);
      await this.revokeRefreshToken(oldRefreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.error(`User not found for refresh token: ${oldRefreshToken}`);
      await this.revokeRefreshToken(oldRefreshToken);
      throw new UnauthorizedException('User associated with token not found');
    }

    await this.revokeRefreshToken(oldRefreshToken);
    const newTokenPair = await this.generateTokenPair(
      user,
      deviceInfo,
      ipAddress,
    );

    this.logger.log(`Tokens refreshed and rotated for userId=${userId}`);
    return newTokenPair;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const redisKey = this._getRedisKey(token);
    await this.refreshTokenRepo.update({ token }, { revoked: true });
    await this.cacheManager.del(redisKey);
    this.logger.debug(`Refresh token marked as revoked: ${token}`);
  }

  private _generateAccessToken(userId: string, roles: UserRole[]): string {
    const payload = { sub: userId, roles };
    const expiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES') || ('1d' as any);
    return this.jwtService.sign(payload, { expiresIn });
  }

  private async _generateRefreshToken(
    user: UserPayload,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<string> {
    const token = uuid();
    const expiresInDays =
      this.configService.get<number>('JWT_REFRESH_DAYS') || 7;
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    );

    const refreshTokenEntity = this.refreshTokenRepo.create({
      token,
      deviceInfo,
      ipAddress,
      expiresAt,
      revoked: false,
    });
    await this.refreshTokenRepo.save(refreshTokenEntity);

    const redisKey = this._getRedisKey(token);

    await this.cacheManager.set(
      redisKey,
      JSON.stringify({ userId: user.id, expiresAt }),
      expiresInDays * 24 * 60 * 60,
    );

    return token;
  }

  private _getRedisKey(token: string): string {
    return `refresh_token:${token}`;
  }
}
