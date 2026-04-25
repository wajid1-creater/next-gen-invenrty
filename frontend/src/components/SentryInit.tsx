'use client';
import { useEffect } from 'react';
import { initClientSentry } from '@/lib/sentry';

/** Tiny client-only component that calls Sentry.init once on mount. */
export default function SentryInit() {
  useEffect(() => {
    initClientSentry();
  }, []);
  return null;
}
