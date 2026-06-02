import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }

    return super.canActivate(context);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips?.[0] || req.ip || req.socket?.remoteAddress || 'unknown';
  }
}
