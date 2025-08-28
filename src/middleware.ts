import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Inline the roles instead of importing from ../types
const ROLE_REDIRECTS: Record<"ADMIN" | "MANAGER" | "MEMBER", string> = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  MEMBER: "/member/dashboard",
};

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl;
    const token = req.nextauth?.token;

    // Root redirect by role
    if (url.pathname === "/") {
      if (token?.role && token.role in ROLE_REDIRECTS) {
        return NextResponse.redirect(
          new URL(ROLE_REDIRECTS[token.role as "ADMIN" | "MANAGER" | "MEMBER"], req.url)
        );
      }
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // allow APIs without auth
        // (but if you want API protection, remove this)
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/", "/admin/:path*", "/manager/:path*", "/member/:path*"],
};
