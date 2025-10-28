import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Redirect /state/ to /states/ to fix analytics duplicate URLs
  if (url.pathname.startsWith('/state/') && !url.pathname.startsWith('/states/')) {
    // Replace /state/ with /states/
    url.pathname = url.pathname.replace(/^\/state\//, '/states/');
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
