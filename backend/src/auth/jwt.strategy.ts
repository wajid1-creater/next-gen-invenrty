import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  type JwtFromRequestFunction,
} from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const ACCESS_COOKIE = 'access_token';

const cookieExtractor: JwtFromRequestFunction = (req: Request) => {
  const token = req?.cookies?.[ACCESS_COOKIE];
  return typeof token === 'string' && token.length > 0 ? token : null;
};

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }
    super({
      // Cookie first (browser SPA), Bearer fallback (curl, mobile, server-to-server).
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  }
}
