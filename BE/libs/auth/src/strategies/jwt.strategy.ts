import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthPayload } from '../dtos/auth.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: AuthPayload) {
    this.logger.debug(`[JwtStrategy] Validating payload:`, payload);
    if (!payload || !payload.sub) {
      this.logger.error(
        '[JwtStrategy] Payload is invalid or missing "sub" (user ID).',
      );
      throw new UnauthorizedException('Invalid token payload.');
    }

    return {
      id: payload.sub,
      identifier: payload.scopes,
      roles: payload.roles,
    };
  }
}
