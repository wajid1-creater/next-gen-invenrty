'use client';

import { useEffect } from 'react';
import { captureClientError } from '@/lib/sentry';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    captureClientError(error);
    console.error('GlobalError:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full px-6 py-10 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
            <span aria-hidden className="text-2xl">
              ⚠️
            </span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Application error</h1>
          <p className="text-sm text-gray-500 mt-2">
            Something went wrong and we couldn&apos;t render this page.
          </p>
          {error.digest ? (
            <p className="mt-3 text-xs text-gray-400 font-mono">ref: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
