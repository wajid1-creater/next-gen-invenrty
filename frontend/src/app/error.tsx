'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { captureClientError } from '@/lib/sentry';

export default function RouteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    captureClientError(error);
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
        <h1 className="text-lg font-semibold text-gray-900">Something went wrong</h1>
        <p className="text-sm text-gray-500 mt-2">
          We hit an unexpected error rendering this page.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-gray-400 font-mono">ref: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
