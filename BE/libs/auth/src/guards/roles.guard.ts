import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthPayload } from '../dtos/auth.payload';
import { UserRole } from '@app/common';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      this.logger.debug(
        `No roles required for handler "${context.getHandler().name}". Access granted.`,
      );
      return true;
    }

    let user: AuthPayload;
    if (context.getType() === 'http') {
      user = context.switchToHttp().getRequest().user;
    } else {
      const ctx = GqlExecutionContext.create(context);
      user = ctx.getContext().req.user;
    }

    if (!user || !user.roles) {
      this.logger.warn(
        `Access denied. No authenticated user or roles found. Required roles: ${requiredRoles.join(
          ', ',
        )}`,
      );
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (hasRole) {
      this.logger.log(
        `Access granted for user "${user.sub}" with roles [${user.roles.join(
          ', ',
        )}] on handler "${context.getHandler().name}". Required roles: [${requiredRoles.join(
          ', ',
        )}]`,
      );
    } else {
      this.logger.warn(
        `Access denied for user "${user.sub}" with roles [${user.roles.join(
          ', ',
        )}] on handler "${context.getHandler().name}". Required roles: [${requiredRoles.join(
          ', ',
        )}]`,
      );
    }

    return hasRole;
  }
}
