import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { createHash } from 'crypto';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import {
  IDEMPOTENCY_METADATA_KEY,
  IdempotencyConfig,
} from '../decorators/idempotent.decorator';
import {
  IdempotencyRecord,
  RedisIdempotencyService,
} from '../services/redis-idempotency.service';

const IDEMPOTENCY_HEADER = 'idempotency-key';
const IDEMPOTENCY_REPLAYED_HEADER = 'Idempotency-Replayed';
const DEFAULT_TTL_SECONDS = 24 * 60 * 60;
const DEFAULT_PENDING_TTL_SECONDS = 60;
const VALID_KEY_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly store: RedisIdempotencyService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const config = this.reflector.get<IdempotencyConfig>(
      IDEMPOTENCY_METADATA_KEY,
      context.getHandler(),
    );

    if (!config) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse<Response>();
    const rawKey = this.readHeader(request.headers[IDEMPOTENCY_HEADER]);

    if (!rawKey) {
      if (config.required) {
        throw new HttpException(
          'Idempotency-Key header is required for this endpoint.',
          HttpStatus.PRECONDITION_REQUIRED,
        );
      }
      return next.handle();
    }

    if (!VALID_KEY_PATTERN.test(rawKey)) {
      throw new UnprocessableEntityException(
        'Idempotency-Key must be 8-128 characters and contain only letters, numbers, dots, underscores, colons, or hyphens.',
      );
    }

    const userId = request.user?.id ?? request.user?.sub ?? 'anonymous';
    const requestHash = this.hashRequest({
      method: request.method,
      path: request.route?.path ?? request.path,
      originalUrl: request.originalUrl,
      body: request.body ?? null,
      userId,
      scope: config.scope,
    });
    const redisKey = this.buildRedisKey(userId, config.scope, rawKey);
    const ttlSeconds = config.ttlSeconds ?? DEFAULT_TTL_SECONDS;
    const pendingTtlSeconds =
      config.pendingTtlSeconds ?? DEFAULT_PENDING_TTL_SECONDS;
    const now = new Date();
    const requestId = request.requestId ?? '';
    const pendingRecord: IdempotencyRecord = {
      status: 'in_progress',
      requestHash,
      requestId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
    };

    request.idempotencyKey = rawKey;

    return from(
      this.prepareRequest(redisKey, pendingRecord, pendingTtlSeconds),
    ).pipe(
      mergeMap((prepared) => {
        if (prepared.replay) {
          response.setHeader(IDEMPOTENCY_REPLAYED_HEADER, 'true');
          response.status(prepared.replay.statusCode ?? 200);
          return of(prepared.replay.responseBody);
        }

        return next.handle().pipe(
          mergeMap((body) => {
            const completedAt = new Date();
            return from(
              this.store.set(
                redisKey,
                {
                  ...pendingRecord,
                  status: 'succeeded',
                  statusCode: response.statusCode,
                  responseBody: body,
                  updatedAt: completedAt.toISOString(),
                },
                ttlSeconds,
              ),
            ).pipe(mergeMap(() => of(body)));
          }),
          catchError((error) =>
            from(
              this.store.set(
                redisKey,
                {
                  ...pendingRecord,
                  status: 'failed',
                  statusCode: error?.status ?? error?.statusCode ?? 500,
                  responseBody: this.toErrorBody(error),
                  updatedAt: new Date().toISOString(),
                },
                Math.min(ttlSeconds, 5 * 60),
              ),
            ).pipe(mergeMap(() => throwError(() => error))),
          ),
        );
      }),
    );
  }

  private async prepareRequest(
    redisKey: string,
    pendingRecord: IdempotencyRecord,
    pendingTtlSeconds: number,
  ): Promise<{ replay?: IdempotencyRecord }> {
    const acquired = await this.store.acquire(
      redisKey,
      pendingRecord,
      pendingTtlSeconds,
    );

    if (acquired) {
      return {};
    }

    const existing = await this.store.get(redisKey);
    if (!existing) {
      throw new ConflictException('Idempotency request is already in progress.');
    }

    if (existing.requestHash !== pendingRecord.requestHash) {
      throw new ConflictException(
        'Idempotency-Key was already used with a different request.',
      );
    }

    if (existing.status === 'succeeded' || existing.status === 'failed') {
      return { replay: existing };
    }

    throw new ConflictException('Idempotency request is already in progress.');
  }

  private readHeader(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0]?.trim() : value?.trim();
  }

  private buildRedisKey(userId: string, scope: string, idempotencyKey: string) {
    const digest = createHash('sha256')
      .update(`${userId}:${scope}:${idempotencyKey}`)
      .digest('hex');
    return `idempotency:${scope}:${digest}`;
  }

  private hashRequest(value: unknown) {
    return createHash('sha256')
      .update(this.stableStringify(value))
      .digest('hex');
  }

  private stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
    }

    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${this.stableStringify(
            (value as Record<string, unknown>)[key],
          )}`,
      )
      .join(',')}}`;
  }

  private toErrorBody(error: any) {
    const response = typeof error?.getResponse === 'function'
      ? error.getResponse()
      : null;

    if (response && typeof response === 'object') {
      return response;
    }

    return {
      statusCode: error?.status ?? error?.statusCode ?? 500,
      message: error?.message ?? 'Request failed',
    };
  }
}
