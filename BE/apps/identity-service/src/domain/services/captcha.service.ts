import { AuthRequestMetadata, RpcExceptionHelper } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TurnstileVerifyResponse {
  success: boolean;
  hostname?: string;
  action?: string;
  cdata?: string;
  'error-codes'?: string[];
}

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);

  constructor(private readonly configService: ConfigService) {}

  isEnabled(): boolean {
    return (
      this.configService.get<string>('CAPTCHA_ENABLED') === 'true' &&
      !!this.configService.get<string>('CAPTCHA_SECRET_KEY')
    );
  }

  async assertValidCaptcha(
    captchaToken: string | undefined,
    metadata?: AuthRequestMetadata,
    expectedAction?: string,
  ): Promise<void> {
    if (!this.isEnabled()) return;

    if (!captchaToken?.trim()) {
      throw RpcExceptionHelper.forbidden('Captcha verification required', {
        captchaRequired: true,
      });
    }

    const provider = this.configService.get<string>(
      'CAPTCHA_PROVIDER',
      'turnstile',
    );

    if (provider !== 'turnstile') {
      this.logger.warn(`Unsupported CAPTCHA_PROVIDER="${provider}"`);
      throw RpcExceptionHelper.forbidden('Captcha verification unavailable');
    }

    const secret = this.configService.get<string>('CAPTCHA_SECRET_KEY');
    const formData = new URLSearchParams();
    formData.set('secret', secret ?? '');
    formData.set('response', captchaToken);
    if (metadata?.ipAddress) {
      formData.set('remoteip', metadata.ipAddress);
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.numberConfig('CAPTCHA_VERIFY_TIMEOUT_MS', 5000),
    );

    try {
      const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: formData,
          signal: controller.signal,
        },
      );
      const result = (await response.json()) as TurnstileVerifyResponse;

      if (!result.success) {
        this.logger.warn('Captcha verification failed', {
          errors: result['error-codes'] ?? [],
        });
        throw RpcExceptionHelper.forbidden('Captcha verification failed', {
          captchaRequired: true,
        });
      }

      if (!this.isAllowedHostname(result.hostname)) {
        this.logger.warn('Captcha hostname validation failed', {
          hostname: result.hostname,
        });
        throw RpcExceptionHelper.forbidden('Captcha verification failed', {
          captchaRequired: true,
        });
      }

      if (expectedAction && result.action !== expectedAction) {
        this.logger.warn('Captcha action validation failed', {
          expectedAction,
          action: result.action,
        });
        throw RpcExceptionHelper.forbidden('Captcha verification failed', {
          captchaRequired: true,
        });
      }
    } catch (error) {
      if (error?.error?.statusCode) throw error;

      this.logger.error('Captcha verification request failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw RpcExceptionHelper.forbidden('Captcha verification unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }

  private isAllowedHostname(hostname: string | undefined): boolean {
    const allowedHostnames = this.configService
      .get<string>('CAPTCHA_ALLOWED_HOSTNAMES', '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (allowedHostnames.length === 0) return true;
    if (!hostname) return false;

    return allowedHostnames.includes(hostname.toLowerCase());
  }

  private numberConfig(key: string, fallback: number): number {
    const value = Number(this.configService.get<string | number>(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
