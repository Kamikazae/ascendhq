import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Skip middleware for auth routes, API routes, and static files
  if (
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.includes("/favicon") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".gif") ||
    url.pathname.endsWith(".webp")
  ) {
    return NextResponse.next();
  }

  // For now, just redirect all protected routes to signin
  // This eliminates the __dirname issue while we debug
  if (url.pathname === "/") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Redirect all other protected routes to signin for now
  return NextResponse.redirect(new URL("/auth/signin", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internals)
     * - favicon and other static assets
     * - auth (auth pages)
     */
    "/((?!api|_next|favicon|.*\\.(ico|png|jpg|jpeg|svg|gif|webp)|auth).*)",
  ],
};

