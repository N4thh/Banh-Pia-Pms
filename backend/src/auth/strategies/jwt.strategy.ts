// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_AT_SECRET as string,
    });
  }
  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      jti: payload.jti,
      role: payload.role,
      exp: payload.exp,
    };
  }
}
