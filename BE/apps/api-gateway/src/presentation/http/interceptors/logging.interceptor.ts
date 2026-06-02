import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

const REQUEST_ID_HEADER = 'X-Request-Id';
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body } = request;
    const requestId = this.resolveRequestId(request.headers?.['x-request-id']);

    // Attach requestId to request for tracing
    request.requestId = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);

    const startTime = Date.now();

    this.logger.log(
      JSON.stringify({
        type: 'REQUEST',
        requestId,
        method,
        url,
        body: this.sanitizeBody(body),
      }),
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const response = context.switchToHttp().getResponse();

        this.logger.log(
          JSON.stringify({
            type: 'RESPONSE',
            requestId,
            method,
            url,
            duration: `${duration}ms`,
            statusCode: response.statusCode,
          }),
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        this.logger.error(
          JSON.stringify({
            type: 'ERROR',
            requestId,
            method,
            url,
            duration: `${duration}ms`,
            error: error.message,
          }),
        );

        throw error;
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    // Remove sensitive fields
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '***';
    if (sanitized.newPassword) sanitized.newPassword = '***';
    if (sanitized.confirmPassword) sanitized.confirmPassword = '***';
    if (sanitized.otp) sanitized.otp = '***';
    if (sanitized.idToken) sanitized.idToken = '***';
    if (sanitized.refreshToken) sanitized.refreshToken = '***';
    if (sanitized.resetToken) sanitized.resetToken = '***';

    return sanitized;
  }

  private resolveRequestId(value: string | string[] | undefined): string {
    const candidate = Array.isArray(value) ? value[0] : value;
    const normalized = candidate?.trim();

    if (normalized && REQUEST_ID_PATTERN.test(normalized)) {
      return normalized;
    }

    return uuidv4();
  }
}
