import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { CSRF_COOKIE, CSRF_HEADER, SKIP_CSRF_KEY } from '../csrf.constants';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-submit cookie CSRF guard.
 *
 * Why we need it: cookies are sent automatically on cross-origin requests, so
 * an attacker's site could trigger a state-changing call against our API while
 * the user is logged in. The defense is to require an extra header that the
 * attacker can't forge (browsers won't expose cross-origin cookies to JS).
 *
 * The frontend reads the `csrf_token` cookie (set by AuthController on every
 * cookie-issuing endpoint) and echoes it back as `X-CSRF-Token` on every
 * non-safe request.
 *
 * Skipped on:
 *   - GET/HEAD/OPTIONS (no state change)
 *   - @Public() routes (login, register, health)
 *   - @SkipCsrf() routes (refresh — the refresh cookie is the secret)
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;

    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method)) return true;

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
    const cookieValue = cookies[CSRF_COOKIE];
    const headerValue = req.headers[CSRF_HEADER] as string | undefined;

    if (!cookieValue || !headerValue || cookieValue !== headerValue) {
      throw new ForbiddenException('Invalid CSRF token');
    }
    return true;
  }
}
