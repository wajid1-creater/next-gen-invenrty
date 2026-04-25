/**
 * Public env vars accessible at runtime.
 *
 * Because these are `NEXT_PUBLIC_*`, the values are inlined at build time —
 * this module runs both at build and at runtime in the browser.
 *
 * `apiUrl` falls back to localhost so a fresh `npm run dev` works without
 * a `.env.local` file. In production builds, the operator should set
 * NEXT_PUBLIC_API_URL explicitly to point at the real backend.
 */

const DEV_DEFAULT_API_URL = 'http://localhost:4000/api';

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.trim() || DEV_DEFAULT_API_URL,
} as const;
