import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
        <p className="text-sm font-medium text-green-600">404</p>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Page not found</h1>
        <p className="text-sm text-gray-500 mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
