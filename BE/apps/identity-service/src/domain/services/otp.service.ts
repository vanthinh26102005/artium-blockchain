import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { OtpContext } from '../enums/otp-context.enum';

interface OtpCacheData {
  otp: string;
  attempts: number;
  payload: any;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_MAX_ATTEMPTS = 5;
  private readonly OTP_RETRY_LIMIT = 5;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async generateAndStoreOtp(
    context: OtpContext,
    identifier: string,
    payload: any,
    ttl = 300000,
  ): Promise<string> {
    await this.checkRequestLimit(context, identifier);

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpKey = this._getOtpKey(context, identifier);
    const otpData: OtpCacheData = { otp, attempts: 0, payload };

    await this.cacheManager.set(otpKey, JSON.stringify(otpData), ttl);
    this.logger.log(
      `[OTP] Stored OTP for ${context}:${identifier} with TTL ${ttl / 1000}s`,
    );

    return otp;
  }

  async verifyOtp<T>(
    context: OtpContext,
    identifier: string,
    otp: string,
  ): Promise<T> {
    const otpKey = this._getOtpKey(context, identifier);
    const storedDataString = await this.cacheManager.get<string>(otpKey);

    if (!storedDataString) {
      throw new BadRequestException('OTP đã hết hạn hoặc không hợp lệ.');
    }

    const storedData: OtpCacheData = JSON.parse(storedDataString);

    if (storedData.attempts >= this.OTP_MAX_ATTEMPTS) {
      await this.cacheManager.del(otpKey);
      throw new BadRequestException(
        `Bạn đã nhập sai OTP quá ${this.OTP_MAX_ATTEMPTS} lần. Vui lòng yêu cầu OTP mới.`,
      );
    }

    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      const remainingTTL = await this._getRemainingTtl(otpKey);
      await this.cacheManager.set(
        otpKey,
        JSON.stringify(storedData),
        remainingTTL,
      );
      throw new BadRequestException(
        `OTP không chính xác. Bạn còn ${this.OTP_MAX_ATTEMPTS - storedData.attempts} lần thử.`,
      );
    }

    return storedData.payload as T;
  }

  async invalidateOtp(context: OtpContext, identifier: string): Promise<void> {
    await this.cacheManager.del(this._getOtpKey(context, identifier));
    await this.cacheManager.del(this._getRetryKey(context, identifier));
    this.logger.log(`[OTP] Invalidated OTP data for ${context}:${identifier}`);
  }

  async generateOneTimeToken<T>(
    context: OtpContext,
    identifier: string,
    payload: T,
    ttl = 600000,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const key = this._getOneTimeTokenKey(context, identifier);

    await this.cacheManager.set(key, JSON.stringify({ token, payload }), ttl);
    this.logger.log(
      `[Token] Stored one-time token for ${context}:${identifier}`,
    );

    return token;
  }

  async verifyAndConsumeOneTimeToken<T>(
    context: OtpContext,
    identifier: string,
    token: string,
  ): Promise<T> {
    const key = this._getOneTimeTokenKey(context, identifier);
    const storedDataString = await this.cacheManager.get<string>(key);

    if (!storedDataString) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }

    const storedData = JSON.parse(storedDataString);

    if (storedData.token !== token) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }

    await this.cacheManager.del(key);

    this.logger.log(
      `[Token] Consumed one-time token for ${context}:${identifier}`,
    );
    return storedData.payload as T;
  }

  // --- Private helper ---

  private async checkRequestLimit(
    context: OtpContext,
    identifier: string,
  ): Promise<void> {
    const retryKey = this._getRetryKey(context, identifier);
    const retryCount = (await this.cacheManager.get<number>(retryKey)) || 0;

    if (retryCount >= this.OTP_RETRY_LIMIT) {
      this.logger.warn(
        `[OTP] Request limit reached for ${context}:${identifier}`,
      );
      throw new BadRequestException(
        'Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
      );
    }

    await this.cacheManager.set(retryKey, retryCount + 1, 3600 * 1000);
  }

  private _getOtpKey(context: OtpContext, identifier: string): string {
    return `otp:${context}:${identifier}`;
  }

  private _getRetryKey(context: OtpContext, identifier: string): string {
    return `otp:retry:${context}:${identifier}`;
  }

  private async _getRemainingTtl(key: string): Promise<number> {
    if (typeof (this.cacheManager.stores as any).ttl === 'function') {
      return (this.cacheManager.stores as any).ttl(key);
    }

    return 300000;
  }

  private _getOneTimeTokenKey(context: OtpContext, identifier: string): string {
    return `one-time-token:${context}:${identifier}`;
  }
}
