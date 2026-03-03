import {
  Injectable,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class M2MJwtGuard extends AuthGuard('m2m-jwt') {
  private readonly logger = new Logger(M2MJwtGuard.name);

  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = this.getRequest(context);
    const authHeader = request?.headers?.authorization;

    if (err || !user) {
      this.logger.warn(
        `[M2M Guard] Authentication failed. Error: ${err?.message || 'No service account found'}, Info: ${info?.message || 'N/A'}`,
      );

      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('M2M JWT token has expired');
      } else if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid M2M JWT token');
      } else if (!authHeader) {
        throw new UnauthorizedException('Missing authorization header');
      } else {
        throw new UnauthorizedException('M2M authentication failed');
      }
    }

    this.logger.debug(
      `[M2M Guard] Authentication successful for service: ${user?.identifier}`,
    );
    return user;
  }
}
