import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor';
import { IdempotencyScope } from './idempotency-scopes';

export const IDEMPOTENCY_METADATA_KEY = 'idempotency:config';

export interface IdempotencyConfig {
  scope: IdempotencyScope;
  required?: boolean;
  ttlSeconds?: number;
  pendingTtlSeconds?: number;
}

export const Idempotent = (config: IdempotencyConfig) =>
  applyDecorators(
    SetMetadata(IDEMPOTENCY_METADATA_KEY, config),
    UseInterceptors(IdempotencyInterceptor),
  );
