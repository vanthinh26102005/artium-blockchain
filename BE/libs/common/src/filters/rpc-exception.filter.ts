import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class AllRpcExceptionsFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(AllRpcExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    // If it's already an RpcException, extract and format the error
    if (exception instanceof RpcException) {
      const error = exception.getError();
      return throwError(() => this.formatError(error));
    }

    // Handle HttpException (BadRequestException, UnauthorizedException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      const errorResponse = {
        statusCode: status,
        message:
          typeof response === 'string'
            ? response
            : (response as any).message || exception.message,
        errors: typeof response === 'object' ? (response as any).errors : null,
      };

      this.logger.error(
        `RPC HttpException: ${errorResponse.message}`,
        exception.stack,
      );

      return throwError(() => errorResponse);
    }

    // Handle validation errors (class-validator)
    if (
      exception?.response?.message &&
      Array.isArray(exception.response.message)
    ) {
      const errorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: exception.response.message,
      };

      this.logger.error(
        `RPC Validation Error: ${JSON.stringify(errorResponse.errors)}`,
      );

      return throwError(() => errorResponse);
    }

    // Handle generic errors
    const errorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception?.message || 'Internal server error',
      errors: null,
    };

    this.logger.error(
      `RPC Unexpected Error: ${exception?.message}`,
      exception?.stack,
    );

    return throwError(() => errorResponse);
  }

  private formatError(error: any): any {
    if (typeof error === 'string') {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
        errors: null,
      };
    }

    if (typeof error === 'object') {
      return {
        statusCode: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'An error occurred',
        errors: error.errors || null,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      errors: null,
    };
  }
}
