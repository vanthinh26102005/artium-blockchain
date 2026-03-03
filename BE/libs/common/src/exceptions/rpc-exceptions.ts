import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export interface RpcErrorPayload {
  statusCode: number;
  message: string;
  errors?: any;
}

export class RpcExceptionHelper {
  static from(statusCode: number, message: string, errors?: any): RpcException {
    return new RpcException({ statusCode, message, errors });
  }

  static badRequest(message: string, errors?: any): RpcException {
    return this.from(HttpStatus.BAD_REQUEST, message, errors);
  }

  static unauthorized(message: string): RpcException {
    return this.from(HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(message: string): RpcException {
    return this.from(HttpStatus.FORBIDDEN, message);
  }

  static notFound(message: string): RpcException {
    return this.from(HttpStatus.NOT_FOUND, message);
  }

  static conflict(message: string): RpcException {
    return this.from(HttpStatus.CONFLICT, message);
  }

  static internalError(message: string): RpcException {
    return this.from(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
