import { describe, expect, it } from '@jest/globals';
import { HttpException } from '@nestjs/common';
import { OtpContext } from '../enums/otp-context.enum';
import { OtpService } from './otp.service';

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

describe(OtpService.name, () => {
  it('blocks immediate OTP resend during cooldown', async () => {
    const service = new OtpService(
      new MemoryCache() as any,
      {
        get: (key: string) =>
          key === 'OTP_RESEND_COOLDOWN_MS' ? 60000 : undefined,
      } as any,
    );

    await service.generateAndStoreOtp(
      OtpContext.USER_REGISTRATION,
      'a@test.dev',
      {
        email: 'a@test.dev',
      },
    );

    let caughtError: unknown;
    try {
      await service.generateAndStoreOtp(
        OtpContext.USER_REGISTRATION,
        'a@test.dev',
        {
          email: 'a@test.dev',
        },
      );
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(HttpException);
    expect((caughtError as HttpException).getStatus()).toBe(429);
  });
});
