import { AuthRequestMetadata, RpcExceptionHelper } from '@app/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CaptchaService } from './captcha.service';

interface LoginProtectionInput {
  email: string;
  captchaToken?: string;
}

@Injectable()
export class AuthAbuseProtectionService {
  private readonly logger = new Logger(AuthAbuseProtectionService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
  ) {}

  async assertCanAttemptEmailLogin(
    input: LoginProtectionInput,
    metadata?: AuthRequestMetadata,
  ): Promise<void> {
    const email = this.normalizeEmail(input.email);
    const blockKey = this.emailBlockKey(email);

    if (await this.cacheManager.get(blockKey)) {
      throw RpcExceptionHelper.tooManyRequests(
        'Too many failed login attempts. Please try again later.',
      );
    }

    if (!(await this.shouldRequireCaptcha(email, metadata))) return;

    await this.captchaService.assertValidCaptcha(
      input.captchaToken,
      metadata,
      'login',
    );
  }

  async assertCaptchaForSensitiveRequest(
    scope: string,
    captchaToken: string | undefined,
    metadata?: AuthRequestMetadata,
    expectedCaptchaAction?: string,
  ): Promise<void> {
    if (await this.shouldRequireCaptchaForSensitiveRequest(scope, metadata)) {
      await this.captchaService.assertValidCaptcha(
        captchaToken,
        metadata,
        expectedCaptchaAction,
      );
    }

    await this.recordSensitiveRequest(scope, metadata);
  }

  async recordEmailLoginFailure(
    email: string,
    metadata?: AuthRequestMetadata,
  ): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    const emailFailures = await this.increment(
      this.emailFailKey(normalizedEmail),
      this.failureWindowMs(),
    );

    if (metadata?.ipAddress) {
      await this.increment(
        this.ipFailKey(metadata.ipAddress),
        this.failureWindowMs(),
      );
      await this.increment(
        this.emailIpFailKey(normalizedEmail, metadata.ipAddress),
        this.failureWindowMs(),
      );
    }

    if (metadata?.deviceId) {
      await this.increment(
        this.deviceFailKey(metadata.deviceId),
        this.failureWindowMs(),
      );
    }

    if (emailFailures >= this.emailBlockThreshold()) {
      await this.cacheManager.set(
        this.emailBlockKey(normalizedEmail),
        true,
        this.blockWindowMs(),
      );
      this.logger.warn(`Email login temporarily blocked: ${normalizedEmail}`);
    }
  }

  async recordEmailLoginSuccess(
    email: string,
    metadata?: AuthRequestMetadata,
  ): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    await this.cacheManager.del(this.emailFailKey(normalizedEmail));
    await this.cacheManager.del(this.emailBlockKey(normalizedEmail));

    if (metadata?.ipAddress) {
      await this.cacheManager.del(
        this.emailIpFailKey(normalizedEmail, metadata.ipAddress),
      );
    }

    if (metadata?.deviceId) {
      await this.cacheManager.del(this.deviceFailKey(metadata.deviceId));
    }
  }

  normalizeEmail(email: string): string {
    return String(email ?? '')
      .trim()
      .toLowerCase();
  }

  private async shouldRequireCaptcha(
    email: string,
    metadata?: AuthRequestMetadata,
  ): Promise<boolean> {
    if (!this.captchaService.isEnabled()) return false;

    const emailFailures =
      (await this.cacheManager.get<number>(this.emailFailKey(email))) || 0;
    if (emailFailures >= this.captchaThreshold()) return true;

    if (metadata?.ipAddress) {
      const ipFailures =
        (await this.cacheManager.get<number>(
          this.ipFailKey(metadata.ipAddress),
        )) || 0;
      if (ipFailures >= this.ipCaptchaThreshold()) return true;
    }

    if (metadata?.deviceId) {
      const deviceFailures =
        (await this.cacheManager.get<number>(
          this.deviceFailKey(metadata.deviceId),
        )) || 0;
      if (deviceFailures >= this.deviceCaptchaThreshold()) return true;
    }

    return false;
  }

  private async shouldRequireCaptchaForSensitiveRequest(
    scope: string,
    metadata?: AuthRequestMetadata,
  ): Promise<boolean> {
    if (!this.captchaService.isEnabled()) return false;

    if (metadata?.ipAddress) {
      const sensitiveIpRequests =
        (await this.cacheManager.get<number>(
          this.sensitiveIpKey(scope, metadata.ipAddress),
        )) || 0;
      if (sensitiveIpRequests >= this.sensitiveCaptchaThreshold()) return true;

      const ipFailures =
        (await this.cacheManager.get<number>(
          this.ipFailKey(metadata.ipAddress),
        )) || 0;
      if (ipFailures >= this.ipCaptchaThreshold()) return true;
    }

    if (metadata?.deviceId) {
      const sensitiveDeviceRequests =
        (await this.cacheManager.get<number>(
          this.sensitiveDeviceKey(scope, metadata.deviceId),
        )) || 0;
      if (sensitiveDeviceRequests >= this.sensitiveCaptchaThreshold()) {
        return true;
      }

      const deviceFailures =
        (await this.cacheManager.get<number>(
          this.deviceFailKey(metadata.deviceId),
        )) || 0;
      if (deviceFailures >= this.deviceCaptchaThreshold()) return true;
    }

    return false;
  }

  private async recordSensitiveRequest(
    scope: string,
    metadata?: AuthRequestMetadata,
  ): Promise<void> {
    if (metadata?.ipAddress) {
      await this.increment(
        this.sensitiveIpKey(scope, metadata.ipAddress),
        this.failureWindowMs(),
      );
    }

    if (metadata?.deviceId) {
      await this.increment(
        this.sensitiveDeviceKey(scope, metadata.deviceId),
        this.failureWindowMs(),
      );
    }
  }

  private async increment(key: string, ttl: number): Promise<number> {
    const current = (await this.cacheManager.get<number>(key)) || 0;
    const next = current + 1;
    await this.cacheManager.set(key, next, ttl);
    return next;
  }

  private captchaThreshold(): number {
    return this.numberConfig('AUTH_CAPTCHA_FAILED_LOGIN_THRESHOLD', 3);
  }

  private emailBlockThreshold(): number {
    return this.numberConfig('AUTH_EMAIL_BLOCK_FAILED_LOGIN_THRESHOLD', 5);
  }

  private sensitiveCaptchaThreshold(): number {
    return this.numberConfig('AUTH_SENSITIVE_CAPTCHA_THRESHOLD', 5);
  }

  private ipCaptchaThreshold(): number {
    return this.numberConfig('AUTH_IP_CAPTCHA_FAILED_LOGIN_THRESHOLD', 20);
  }

  private deviceCaptchaThreshold(): number {
    return this.numberConfig('AUTH_DEVICE_CAPTCHA_FAILED_LOGIN_THRESHOLD', 10);
  }

  private failureWindowMs(): number {
    return this.numberConfig('AUTH_FAILURE_WINDOW_MS', 60 * 60 * 1000);
  }

  private blockWindowMs(): number {
    return this.numberConfig('AUTH_BLOCK_WINDOW_MS', 15 * 60 * 1000);
  }

  private numberConfig(key: string, fallback: number): number {
    const value = Number(this.configService.get<string | number>(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private emailFailKey(email: string): string {
    return `auth:fail:email:${email}`;
  }

  private ipFailKey(ipAddress: string): string {
    return `auth:fail:ip:${ipAddress}`;
  }

  private deviceFailKey(deviceId: string): string {
    return `auth:fail:device:${deviceId}`;
  }

  private emailIpFailKey(email: string, ipAddress: string): string {
    return `auth:fail:email-ip:${email}:${ipAddress}`;
  }

  private sensitiveIpKey(scope: string, ipAddress: string): string {
    return `auth:sensitive:${scope}:ip:${ipAddress}`;
  }

  private sensitiveDeviceKey(scope: string, deviceId: string): string {
    return `auth:sensitive:${scope}:device:${deviceId}`;
  }

  private emailBlockKey(email: string): string {
    return `auth:block:email:${email}`;
  }
}
