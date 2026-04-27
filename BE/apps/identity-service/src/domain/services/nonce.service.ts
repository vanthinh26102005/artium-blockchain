import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Injectable()
export class NonceService {
  private static readonly NONCE_TTL_MS = 300_000; // 5 minutes

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async generateNonce(address: string): Promise<string> {
    const nonce = crypto.randomBytes(16).toString('hex');
    const key = `siwe_nonce:${address.toLowerCase()}`;
    await this.cacheManager.set(key, nonce, NonceService.NONCE_TTL_MS);
    return nonce;
  }

  async verifyAndConsumeNonce(
    address: string,
    nonce: string,
  ): Promise<boolean> {
    const key = `siwe_nonce:${address.toLowerCase()}`;
    const stored = await this.cacheManager.get<string>(key);
    if (!stored || stored !== nonce) return false;
    await this.cacheManager.del(key);
    return true;
  }
}
