/**
 * Common interface for API clients
 * Defines the contract that all service clients must follow
 */
export interface IApiClient {
  /**
   * Get the service name this client connects to
   */
  readonly serviceName: string;

  /**
   * Get the base URL for the service
   */
  readonly baseUrl: string;

  /**
   * Get the current timeout configuration
   */
  readonly timeout: number;

  /**
   * Health check to verify if the service is reachable
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Common response wrapper for API client responses
 */
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: Date;
  request_id?: string;
}

/**
 * Configuration options for API clients
 */
export interface ApiClientOptions {
  /**
   * Base URL for the service (can override default)
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number;

  /**
   * Number of retry attempts (default: 3)
   */
  retryAttempts?: number;

  /**
   * Base retry delay in milliseconds (default: 1000)
   */
  retryDelay?: number;

  /**
   * API version (default: v1)
   */
  version?: string;

  /**
   * Additional headers to include with all requests
   */
  headers?: Record<string, string>;

  /**
   * Service authentication token if required
   */
  authToken?: string;
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  REQUEST_TIMEOUT = 408,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  StatusCode: number;
  Message: string;
  Error?: string;
  Timestamp: string;
  RequestId?: string;
}

/**
 * Log levels for consistent logging across API clients
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Configuration for logging behavior
 */
export interface LogConfig {
  /**
   * Minimum log level to output
   */
  level: LogLevel;

  /**
   * Whether to include request/response payloads in logs
   * WARNING: Set to false in production for security
   */
  includePayloads: boolean;

  /**
   * Whether to include headers in logs
   * WARNING: Set to false in production for security (may contain sensitive data)
   */
  includeHeaders: false;
}

/**
 * HTTP method enumeration
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

/**
 * Request configuration interface
 */
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  requestId?: string;
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  statusCode: number;
  headers: Record<string, string>;
  requestId: string;
  responseTime: number; // in milliseconds
  timestamp: Date;
}
