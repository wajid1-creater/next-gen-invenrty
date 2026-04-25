import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge gate for authenticated app routes.
 *
 * What this does: redirects unauthenticated requests to /login (with a `next`
 * query param so we can return them after sign-in) by checking for the
 * presence of the `access_token` httpOnly cookie set by the backend on login.
 *
 * What this DOES NOT do: validate the token. The backend remains the source of
 * truth for auth — this is just a fast path that avoids streaming protected
 * pages to logged-out users. Server actions and API requests still get a real
 * 401 from Nest if the cookie is forged or expired.
 *
 * Renamed from `middleware.ts` per Next.js 16 (see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 */

const PUBLIC_PATHS = ['/login', '/register'];
const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    // If the user is already signed in, bounce them to the dashboard.
    const hasSession = request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);
    if (hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // For everything else: require *some* session cookie. We accept either —
  // an expired access token can be refreshed client-side via /auth/refresh.
  const hasSession = request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, static assets, and the root which handles its own redirect.
  matcher: ['/((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt|xml)).*)'],
};
