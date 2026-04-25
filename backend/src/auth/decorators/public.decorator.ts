import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route as public — JWT guard will skip it. Used for health checks,
 * login/register, and anything that must work pre-auth.
 *
 * Wired up by `JwtAuthGuard` reading `Reflector.get(IS_PUBLIC_KEY)`.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
