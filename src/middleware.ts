import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Inline the roles instead of importing from ../types
const ROLE_REDIRECTS: Record<"ADMIN" | "MANAGER" | "MEMBER", string> = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  MEMBER: "/member/dashboard",
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Skip middleware for auth routes, API routes, and static files
  if (
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  try {
    // Get the token using next-auth/jwt which is Edge Runtime compatible
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Root redirect by role
    if (url.pathname === "/") {
      if (token?.role && token.role in ROLE_REDIRECTS) {
        return NextResponse.redirect(
          new URL(ROLE_REDIRECTS[token.role as "ADMIN" | "MANAGER" | "MEMBER"], request.url)
        );
      }
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Protect all other matched routes
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Fallback to signin on any error
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
};

