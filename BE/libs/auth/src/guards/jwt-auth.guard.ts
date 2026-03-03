import {
  Injectable,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }
    const ctx = GqlExecutionContext.create(context);
    this.logger.debug(
      `[Guard] Intercepting request. Auth Header: ${ctx.getContext().req.headers.authorization ? 'Present' : 'Missing'}`,
    );

    return ctx.getContext().req;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = this.getRequest(context);
    const authHeader = request?.headers?.authorization;

    if (err || !user) {
      this.logger.warn(
        `[Guard] Authentication failed. Error: ${err?.message || 'No user found'}, Info: ${info?.message || 'N/A'}`,
      );

      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('JWT token has expired');
      } else if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid JWT token');
      } else if (!authHeader) {
        throw new UnauthorizedException('Missing authorization header');
      } else {
        throw new UnauthorizedException('Authentication failed');
      }
    }

    this.logger.debug(
      `[Guard] Authentication successful for user: ${user?.id}`,
    );
    return user;
  }
}
