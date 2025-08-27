import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "../types/auth";

const ROLE_REDIRECTS: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  MEMBER: "/member/dashboard",
};

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    try {
      const url = req.nextUrl;
      const token = req.nextauth?.token;

      // When hitting `/`, redirect based on role
      if (url.pathname === "/") {
        if (token?.role && token.role in ROLE_REDIRECTS) {
          return NextResponse.redirect(new URL(ROLE_REDIRECTS[token.role as UserRole], req.url));
        }
        // if not logged in → signin
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      // Fallback to signin on any error
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const url = req.nextUrl;

        // Allow API routes
        if (url.pathname.startsWith("/api")) return true;

        // Block if no token and not already on signin
        if (!token?.role && url.pathname !== "/auth/signin") return false;

        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/manager/:path*",
    "/member/:path*",
  ],
};
