import { SetMetadata } from '@nestjs/common';

export const CSRF_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'x-csrf-token';

/** Mark a route as exempt from CSRF (use for endpoints whose own cookie IS the secret). */
export const SKIP_CSRF_KEY = 'skipCsrf';
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
