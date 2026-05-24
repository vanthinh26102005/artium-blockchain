import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export type IdempotencyRecordStatus = 'in_progress' | 'succeeded' | 'failed';

export interface IdempotencyRecord {
  status: IdempotencyRecordStatus;
  requestHash: string;
  requestId: string;
  statusCode?: number;
  responseBody?: unknown;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

@Injectable()
export class RedisIdempotencyService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisIdempotencyService.name);
  private client?: RedisClientType;
  private ready = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL')?.trim();
    const redisHost = this.configService.get<string>('REDIS_HOST')?.trim();
    const redisPort = this.configService.get<number>('REDIS_PORT') ?? 6379;
    const tlsEnabled = this.configService.get<string>('REDIS_TLS') === 'true';

    if (!redisUrl && !redisHost) {
      this.logger.warn(
        'Redis is not configured; Idempotency-Key support is disabled.',
      );
      return;
    }

    const url = redisUrl || `redis://${redisHost}:${redisPort}`;
    this.client = createClient({
      url,
      ...(tlsEnabled ? { socket: { tls: true } } : {}),
    });

    this.client.on('error', (error) => {
      this.ready = false;
      this.logger.error(`Redis idempotency error: ${error.message}`);
    });

    await this.client.connect();
    this.ready = true;
    this.logger.log('Redis idempotency client connected.');
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }

  assertReady() {
    if (!this.ready || !this.client?.isOpen) {
      throw new ServiceUnavailableException(
        'Idempotency storage is unavailable. Please retry later.',
      );
    }
  }

  async acquire(
    key: string,
    record: IdempotencyRecord,
    ttlSeconds: number,
  ): Promise<boolean> {
    this.assertReady();
    const result = await this.client!.set(key, JSON.stringify(record), {
      NX: true,
      EX: ttlSeconds,
    });
    return result === 'OK';
  }

  async get(key: string): Promise<IdempotencyRecord | null> {
    this.assertReady();
    const value = await this.client!.get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as IdempotencyRecord;
  }

  async set(
    key: string,
    record: IdempotencyRecord,
    ttlSeconds: number,
  ): Promise<void> {
    this.assertReady();
    await this.client!.set(key, JSON.stringify(record), {
      EX: ttlSeconds,
    });
  }

  async del(key: string): Promise<void> {
    this.assertReady();
    await this.client!.del(key);
  }
}
