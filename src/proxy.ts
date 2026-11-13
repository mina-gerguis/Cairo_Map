import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') || request.nextUrl.host;

  // 1. Enforce HTTPS in Production (301 Permanent Redirect)
  const proto = request.headers.get('x-forwarded-proto');
  if (process.env.NODE_ENV === 'production' && proto === 'http') {
    const httpsUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${host}`);
    return NextResponse.redirect(httpsUrl, { status: 301 });
  }

  const { pathname } = request.nextUrl;

  // 2. CORS & CSRF Protection on API endpoints
  if (pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const secFetchSite = request.headers.get('sec-fetch-site');

    // Handle OPTIONS Preflight
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Max-Age', '86400');
      }
      return response;
    }

    // CSRF Guard: On mutating requests (POST/PUT/DELETE/PATCH), reject cross-site forged calls
    const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
    if (isMutating && process.env.NODE_ENV === 'production') {
      // If browser provided sec-fetch-site and it is cross-site, reject immediately
      if (secFetchSite === 'cross-site') {
        return NextResponse.json(
          { error: 'Security violation: Cross-site request rejected (CSRF Protection)' },
          { status: 403 }
        );
      }

      // If origin header is present, ensure it matches current host
      if (origin) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return NextResponse.json(
              { error: 'Security violation: Unauthorized origin (CORS/CSRF Protection)' },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json({ error: 'Malformed Origin Header' }, { status: 400 });
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, and public image assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
