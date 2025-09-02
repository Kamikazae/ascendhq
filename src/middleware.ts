import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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

  // Get the token to check authentication
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // If no token (not authenticated), redirect to signin
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Handle role-based routing for authenticated users
  const userRole = token.role as string;
  
  // Root path - redirect based on role
  if (url.pathname === "/") {
    switch (userRole) {
      case "ADMIN":
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      case "MANAGER":
        return NextResponse.redirect(new URL("/manager/dashboard", request.url));
      case "MEMBER":
        return NextResponse.redirect(new URL("/member/dashboard", request.url));
      default:
        return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // Check role-based access for protected routes
  if (url.pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  
  if (url.pathname.startsWith("/manager") && !["ADMIN", "MANAGER"].includes(userRole)) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  
  if (url.pathname.startsWith("/member") && !["ADMIN", "MANAGER", "MEMBER"].includes(userRole)) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Allow access to the route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|api|auth).*)",
  ],
};

