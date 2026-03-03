import { HttpStatus, LogLevel } from '../interfaces/api-client.interface';

/**
 * Base exception class for API client errors
 */
export abstract class ApiClientException extends Error {
  public readonly statusCode: HttpStatus;
  public readonly serviceName: string;
  public readonly requestId?: string;
  public readonly timestamp: Date;
  public readonly retries: number;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    serviceName: string = 'unknown',
    requestId?: string,
    retries: number = 0,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.serviceName = serviceName;
    this.requestId = requestId;
    this.timestamp = new Date();
    this.retries = retries;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Get error details as a structured object
   */
  public toJSON() {
    return {
      name: this.constructor.name,
      message: this.message,
      statusCode: this.statusCode,
      serviceName: this.serviceName,
      requestId: this.requestId,
      timestamp: this.timestamp.toISOString(),
      retries: this.retries,
      stack: this.stack,
    };
  }

  /**
   * Check if this is a client error (4xx status)
   */
  public isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if this is a server error (5xx status)
   */
  public isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if error is retryable
   */
  public isRetryable(): boolean {
    // Server errors and some client errors are retryable
    return (
      this.isServerError() ||
      this.statusCode === HttpStatus.REQUEST_TIMEOUT ||
      this.statusCode === HttpStatus.SERVICE_UNAVAILABLE
    );
  }

  /**
   * Get recommended log level for this error
   */
  public getLogLevel(): LogLevel {
    if (this.isServerError()) {
      return LogLevel.ERROR;
    }
    return LogLevel.WARN;
  }
}

/**
 * Exception for API request timeout
 */
export class ApiTimeoutException extends ApiClientException {
  constructor(
    serviceName: string,
    timeout: number,
    requestId?: string,
    retries: number = 0,
  ) {
    super(
      `Request to ${serviceName} timed out after ${timeout}ms (retries: ${retries})`,
      HttpStatus.REQUEST_TIMEOUT,
      serviceName,
      requestId,
      retries,
    );
  }
}

/**
 * Exception for service unavailable
 */
export class ServiceUnavailableException extends ApiClientException {
  constructor(serviceName: string, requestId?: string, retries: number = 0) {
    super(
      `Service ${serviceName} is currently unavailable (retries: ${retries})`,
      HttpStatus.SERVICE_UNAVAILABLE,
      serviceName,
      requestId,
      retries,
    );
  }
}

/**
 * Exception for authentication failures
 */
export class AuthenticationException extends ApiClientException {
  constructor(
    serviceName: string,
    message: string = 'Authentication failed',
    requestId?: string,
  ) {
    super(message, HttpStatus.UNAUTHORIZED, serviceName, requestId);
  }
}

/**
 * Exception for authorization failures
 */
export class AuthorizationException extends ApiClientException {
  constructor(
    serviceName: string,
    message: string = 'Access denied',
    requestId?: string,
  ) {
    super(message, HttpStatus.FORBIDDEN, serviceName, requestId);
  }
}

/**
 * Exception for resource not found
 */
export class ResourceNotFoundException extends ApiClientException {
  constructor(
    serviceName: string,
    resource: string,
    resourceId?: string,
    requestId?: string,
  ) {
    const message = resourceId
      ? `${resource} with ID ${resourceId} not found in service ${serviceName}`
      : `${resource} not found in service ${serviceName}`;

    super(message, HttpStatus.NOT_FOUND, serviceName, requestId);
  }
}

/**
 * Exception for invalid request data
 */
export class BadRequestException extends ApiClientException {
  public readonly validationErrors: string[];

  constructor(
    serviceName: string,
    validationErrors: string[],
    requestId?: string,
  ) {
    const message = `Validation errors: ${validationErrors.join(', ')}`;
    super(message, HttpStatus.BAD_REQUEST, serviceName, requestId);
    this.validationErrors = validationErrors;
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      validationErrors: this.validationErrors,
    };
  }
}

/**
 * Exception for network/transport errors
 */
export class NetworkException extends ApiClientException {
  constructor(
    serviceName: string,
    networkError: Error,
    requestId?: string,
    retries: number = 0,
  ) {
    super(
      `Network error when calling ${serviceName}: ${networkError.message}`,
      HttpStatus.SERVICE_UNAVAILABLE,
      serviceName,
      requestId,
      retries,
    );

    // Include the original network error details
    this.stack = `${this.stack}\n--- Original Network Error ---\n${networkError.stack}`;
  }
}

/**
 * Exception for API rate limiting
 */
export class RateLimitException extends ApiClientException {
  public readonly retryAfter?: number; // seconds to wait before retrying

  constructor(serviceName: string, retryAfter?: number, requestId?: string) {
    const message = retryAfter
      ? `Rate limit exceeded for service ${serviceName}. Retry after ${retryAfter} seconds.`
      : `Rate limit exceeded for service ${serviceName}.`;

    super(message, HttpStatus.TOO_MANY_REQUESTS, serviceName, requestId);
    this.retryAfter = retryAfter;
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Exception for service misconfiguration
 */
export class ConfigurationException extends ApiClientException {
  constructor(serviceName: string, configError: string) {
    super(
      `Configuration error for service ${serviceName}: ${configError}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      serviceName,
    );
  }
}

/**
 * Factory function to create appropriate exception based on HTTP status code
 */
export function createApiException(
  statusCode: HttpStatus,
  serviceName: string,
  message: string,
  requestId?: string,
  retries: number = 0,
): ApiClientException {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return new BadRequestException(serviceName, [message], requestId);

    case HttpStatus.UNAUTHORIZED:
      return new AuthenticationException(serviceName, message, requestId);

    case HttpStatus.FORBIDDEN:
      return new AuthorizationException(serviceName, message, requestId);

    case HttpStatus.NOT_FOUND:
      return new ResourceNotFoundException(
        serviceName,
        'resource',
        undefined,
        requestId,
      );

    case HttpStatus.REQUEST_TIMEOUT:
      return new ApiTimeoutException(serviceName, 30000, requestId, retries); // Default timeout

    case HttpStatus.SERVICE_UNAVAILABLE:
      return new ServiceUnavailableException(serviceName, requestId, retries);

    // HTTP 429 (Too Many Requests) - add to interface if needed
    case 429:
      return new RateLimitException(serviceName, undefined, requestId);

    default:
      return new (class extends ApiClientException {
        constructor() {
          super(message, statusCode, serviceName, requestId, retries);
        }
      })();
  }
}
