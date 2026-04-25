import * as Sentry from '@sentry/node';

let initialised = false;

/**
 * No-op when SENTRY_DSN is empty so dev/test runs stay quiet.
 *
 * Called from main.ts before Nest boots so Sentry can capture early failures.
 * Production traces are sampled at 10% by default — bump SENTRY_TRACES_SAMPLE_RATE
 * to dig into perf, knock to 0 to drop the cost.
 */
export function initSentry(): void {
  if (initialised) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  });
  initialised = true;
}

export { Sentry };
