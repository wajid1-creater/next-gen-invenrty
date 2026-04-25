'use client';
import * as Sentry from '@sentry/browser';

let initialised = false;

/**
 * Initialise Sentry on the client.
 *
 * No-op when NEXT_PUBLIC_SENTRY_DSN is empty so local/dev builds don't ship
 * errors anywhere. Called from `app/layout.tsx` so it runs before any page
 * code can throw.
 */
export function initClientSentry(): void {
  if (initialised) return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV ?? 'development',
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    // Conservative defaults — bump tracesSampleRate to enable performance monitoring.
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0'),
  });
  initialised = true;
}

export function captureClientError(err: unknown): void {
  if (!initialised) return;
  Sentry.captureException(err);
}
