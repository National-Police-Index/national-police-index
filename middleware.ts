import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  if (url.pathname.startsWith("/state/")) {
    if (!url.pathname.startsWith("/states/")) {
      url.pathname = url.pathname.replace(/^\/state\//, "/states/");
      return NextResponse.redirect(url, 301); // Permanent redirect
    }
  }
  
  if (url.pathname.startsWith("/state")) {
    const parts = url.pathname.split("/");
    // Lowercase only segments 1 and 2 ("states" and the state slug),
    // leave the rest (agency name, officer name, etc.) untouched.
    const newParts = parts.map((part, i) => (i <= 2 ? part.toLowerCase() : part));
    const newPath = newParts.join("/");
    if (url.pathname !== newPath) {
      url.pathname = newPath;
      return NextResponse.redirect(url, 308); // Permanent redirect (SEO friendly)
    }
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

