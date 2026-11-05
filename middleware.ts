import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge check only: is there a session cookie? Real auth + RBAC is enforced
// by NestJS on every /backend/* call (JWT verify + role + team scope).
// Middleware cannot verify safely here, so it only redirects for UX.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/backend') || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }
  // The access cookie dies after 15 minutes; the refresh cookie (30 days) lets the app renew it silently.
  const hasAccess = Boolean(req.cookies.get('access')?.value);
  const hasSession = hasAccess || Boolean(req.cookies.get('refresh')?.value);
  if (!hasSession && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  // Only bounce away from /login when the access cookie is live; a stale refresh cookie must not cause a redirect loop.
  if (hasAccess && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  return NextResponse.next();
}

// Static files in /public (logo, images) must stay reachable on the login page.
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf)$|manifest.webmanifest|sw.js|offline.html).*)'] };
