import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';

const logger = new Logger('RpcHelper');

export interface RpcOptions {
  timeout?: number;
  defaultErrorMessage?: string;
}

export async function sendRpc<T>(
  client: ClientProxy,
  pattern: { cmd: string },
  data: any,
  options: RpcOptions = {},
): Promise<T> {
  const timeoutMs = options.timeout || 30000;
  const defaultErrorMessage =
    options.defaultErrorMessage || 'An unexpected error occurred';

  try {
    const result = await firstValueFrom(
      client.send(pattern, data).pipe(timeout(timeoutMs)),
    );
    return result as T;
  } catch (error: any) {
    // Handle timeout errors
    if (error instanceof TimeoutError) {
      logger.error(`RPC timeout for command: ${pattern.cmd}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.GATEWAY_TIMEOUT,
          message: 'Service timeout. Please try again later.',
        },
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    // Already an HttpException, rethrow as is
    if (error instanceof HttpException) {
      throw error;
    }

    // Extract error data from RPC response
    const errorData = error?.error || error;

    // Handle 401 Unauthorized
    if (errorData?.statusCode === HttpStatus.UNAUTHORIZED) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: errorData.message || 'Unauthorized',
          errors: errorData.errors || null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Handle 400 Bad Request
    if (errorData?.statusCode === HttpStatus.BAD_REQUEST) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: errorData.message || 'Bad request',
          errors: errorData.errors || null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Handle 403 Forbidden
    if (errorData?.statusCode === HttpStatus.FORBIDDEN) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: errorData.message || 'Forbidden',
          errors: errorData.errors || null,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Handle 404 Not Found
    if (errorData?.statusCode === HttpStatus.NOT_FOUND) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: errorData.message || 'Resource not found',
          errors: errorData.errors || null,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Handle 409 Conflict
    if (errorData?.statusCode === HttpStatus.CONFLICT) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: errorData.message || 'Conflict',
          errors: errorData.errors || null,
        },
        HttpStatus.CONFLICT,
      );
    }

    // Handle 422 Unprocessable Entity
    if (errorData?.statusCode === HttpStatus.UNPROCESSABLE_ENTITY) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: errorData.message || 'Unprocessable entity',
          errors: errorData.errors || null,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // Handle any other status code from microservice
    if (errorData?.statusCode) {
      throw new HttpException(
        {
          statusCode: errorData.statusCode,
          message: errorData.message || defaultErrorMessage,
          errors: errorData.errors || null,
        },
        errorData.statusCode,
      );
    }

    // Handle error with response property (NestJS HttpException format)
    if (errorData?.response) {
      const statusCode =
        errorData.status ||
        errorData.response.statusCode ||
        HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          statusCode,
          message:
            errorData.response.message ||
            errorData.message ||
            defaultErrorMessage,
          errors: errorData.response.errors || null,
        },
        statusCode,
      );
    }

    // Log unexpected errors
    logger.error(`Unexpected RPC error [${pattern.cmd}]:`, {
      message: errorData?.message || error?.message,
      stack: errorData?.stack || error?.stack,
      error: errorData,
    });

    // Fallback to internal server error
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: defaultErrorMessage,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
