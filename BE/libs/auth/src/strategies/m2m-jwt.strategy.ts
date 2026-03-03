import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthPayload } from '../dtos/auth.payload';

@Injectable()
export class M2MJwtStrategy extends PassportStrategy(Strategy, 'm2m-jwt') {
  private readonly logger = new Logger(M2MJwtStrategy.name);

  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: AuthPayload) {
    this.logger.debug(`[M2MJwtStrategy] Validating M2M payload:`, payload);

    if (!payload.sub) {
      this.logger.error(
        '[M2MJwtStrategy] Token has an "sub" claim, this is a user token, not an M2M token.',
      );
      throw new UnauthorizedException(
        'Invalid token type for M2M authentication.',
      );
    }

    const clientInfo = { clientId: payload.sub, scopes: payload.scopes };
    this.logger.debug(
      '[M2MJwtStrategy] M2M Token validated successfully.',
      clientInfo,
    );
    return clientInfo;
  }
}
