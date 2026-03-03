import { SetMetadata } from '@nestjs/common';
import { LogConfig } from '../interfaces/api-client.interface';

/**
 * Decorator to mark a class as an API client
 */
export const API_CLIENT_METADATA_KEY = 'api_client';

/**
 * ApiClient decorator metadata interface
 */
export interface ApiClientMetadata {
  serviceName: string;
  defaultBaseUrl: string;
  defaultPort?: number;
  version?: string;
  description?: string;
  healthEndpoint?: string;
}

/**
 * Decorator to define API client configuration
 */
export function ApiClient(metadata: ApiClientMetadata) {
  return (target: any) => {
    SetMetadata(API_CLIENT_METADATA_KEY, metadata);
    return target;
  };
}

/**
 * Decorator for retry configuration
 */
export const RETRY_METADATA_KEY = 'api_client_retry';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffMultiplier?: number;
  retryableErrors?: string[];
  retryableStatuses?: number[];
}

export function Retry(config: Partial<RetryConfig> = {}) {
  const defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'],
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    ...config,
  };

  return SetMetadata(RETRY_METADATA_KEY, defaultConfig);
}

/**
 * Decorator for timeout configuration
 */
export const TIMEOUT_METADATA_KEY = 'api_client_timeout';

export interface TimeoutConfig {
  connect?: number; // milliseconds
  read?: number; // milliseconds
  request?: number; // milliseconds
}

export function Timeout(config: TimeoutConfig) {
  const defaultConfig: TimeoutConfig = {
    connect: 5000,
    read: 30000,
    request: 35000,
    ...config,
  };

  return SetMetadata(TIMEOUT_METADATA_KEY, defaultConfig);
}

/**
 * Decorator for logging configuration
 */
export const LOGGING_METADATA_KEY = 'api_client_logging';

export function Logging(config: Partial<LogConfig>) {
  const defaultConfig: LogConfig = {
    level: 'info' as any,
    includePayloads: false,
    includeHeaders: false,
    ...config,
  };

  return SetMetadata(LOGGING_METADATA_KEY, defaultConfig);
}

/**
 * Decorator to mark a class method as an API endpoint
 */
export const API_ENDPOINT_METADATA_KEY = 'api_endpoint';

export interface ApiEndpointMetadata {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
  timeout?: number;
  retry?: boolean;
}

export function ApiEndpoint(metadata: ApiEndpointMetadata) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const existingEndpoints =
      Reflect.getMetadata(API_ENDPOINT_METADATA_KEY, target) || [];
    existingEndpoints.push({
      ...metadata,
      method: propertyKey,
    });
    Reflect.defineMetadata(
      API_ENDPOINT_METADATA_KEY,
      existingEndpoints,
      target,
    );
    return descriptor;
  };
}

/**
 * Decorator to mark a method as requiring authentication
 */
export const REQUIRES_AUTH_METADATA_KEY = 'requires_auth';

export function RequiresAuth(token?: string) {
  return SetMetadata(REQUIRES_AUTH_METADATA_KEY, { required: true, token });
}

/**
 * Decorator for cache configuration
 */
export const CACHE_METADATA_KEY = 'api_client_cache';

export interface CacheConfig {
  ttl: number; // seconds
  key?: string;
  tags?: string[];
  invalidateOn?: string[];
}

export function Cache(config: CacheConfig) {
  return SetMetadata(CACHE_METADATA_KEY, config);
}

/**
 * Decorator for rate limiting configuration
 */
export const RATE_LIMIT_METADATA_KEY = 'api_client_rate_limit';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  key?: string;
}

export function RateLimit(config: RateLimitConfig) {
  return SetMetadata(RATE_LIMIT_METADATA_KEY, config);
}
