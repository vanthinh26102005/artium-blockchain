import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RpcExceptionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        return throwError(() => this.transformError(error));
      }),
    );
  }

  private transformError(error: any): HttpException {
    // Already an HttpException, return as is
    if (error instanceof HttpException) {
      return error;
    }

    // Handle RPC exceptions from microservices
    if (typeof error === 'object' && error !== null) {
      // RPC errors are typically wrapped in error.error
      const rpcError = error.error || error;

      if (rpcError.statusCode && rpcError.message) {
        return new HttpException(
          {
            statusCode: rpcError.statusCode,
            message: rpcError.message,
            errors: rpcError.errors || null,
          },
          rpcError.statusCode,
        );
      }

      // Handle error with response property (NestJS HttpException format)
      if (rpcError.response) {
        const statusCode =
          rpcError.status ||
          rpcError.response.statusCode ||
          HttpStatus.INTERNAL_SERVER_ERROR;
        return new HttpException(
          {
            statusCode,
            message: rpcError.response.message || rpcError.message,
            errors: rpcError.response.errors || null,
          },
          statusCode,
        );
      }

      // Handle plain error with message
      if (rpcError.message) {
        this.logger.error('RPC Error:', {
          message: rpcError.message,
          stack: rpcError.stack,
        });
        return new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // Fallback for unknown errors
    this.logger.error('Unknown error type:', error);
    return new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
