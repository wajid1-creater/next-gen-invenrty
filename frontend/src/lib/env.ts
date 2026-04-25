/**
 * Validated public env vars.
 *
 * Because these are `NEXT_PUBLIC_*`, the values are inlined at build time —
 * this module runs both at build and at runtime in the browser. Throwing here
 * fails the build fast instead of letting undefined values silently propagate.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  apiUrl: required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
} as const;
