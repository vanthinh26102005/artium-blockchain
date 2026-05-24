import { describe, expect, it, jest } from '@jest/globals';
import { RpcException } from '@nestjs/microservices';
import { AuthAbuseProtectionService } from './auth-abuse-protection.service';

class MemoryCache {
  private readonly data = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.data.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.data.delete(key);
  }
}

const config = {
  get: (key: string) => {
    const values: Record<string, string | number> = {
      AUTH_CAPTCHA_FAILED_LOGIN_THRESHOLD: 3,
      AUTH_EMAIL_BLOCK_FAILED_LOGIN_THRESHOLD: 5,
      AUTH_FAILURE_WINDOW_MS: 3600000,
      AUTH_BLOCK_WINDOW_MS: 900000,
    };
    return values[key];
  },
};

describe(AuthAbuseProtectionService.name, () => {
  it('requires captcha after repeated email login failures', async () => {
    const captchaService = {
      isEnabled: jest.fn(() => true),
      assertValidCaptcha: jest.fn(async (token?: string) => {
        if (!token) {
          throw new RpcException({
            statusCode: 403,
            message: 'Captcha verification required',
            errors: { captchaRequired: true },
          });
        }
      }),
    };
    const service = new AuthAbuseProtectionService(
      new MemoryCache() as any,
      config as any,
      captchaService as any,
    );

    await service.recordEmailLoginFailure('USER@Test.Dev');
    await service.recordEmailLoginFailure('user@test.dev');
    await service.recordEmailLoginFailure('user@test.dev');

    await expect(
      service.assertCanAttemptEmailLogin({ email: 'user@test.dev' }),
    ).rejects.toBeInstanceOf(RpcException);

    await service.assertCanAttemptEmailLogin({
      email: 'user@test.dev',
      captchaToken: 'valid-token',
    });

    expect(captchaService.assertValidCaptcha).toHaveBeenCalled();
    expect(captchaService.assertValidCaptcha.mock.calls.at(-1)?.[0]).toBe(
      'valid-token',
    );
  });

  it('temporarily blocks an email after the failed login threshold', async () => {
    const service = new AuthAbuseProtectionService(
      new MemoryCache() as any,
      config as any,
      {
        isEnabled: jest.fn(() => false),
        assertValidCaptcha: jest.fn(),
      } as any,
    );

    for (let i = 0; i < 5; i += 1) {
      await service.recordEmailLoginFailure('blocked@test.dev');
    }

    await expect(
      service.assertCanAttemptEmailLogin({ email: 'blocked@test.dev' }),
    ).rejects.toBeInstanceOf(RpcException);
  });
});
