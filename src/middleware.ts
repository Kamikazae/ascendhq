import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  MEMBER: "/member/dashboard",
};

export default withAuth({
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
});

interface NextAuthToken {
  role?: keyof typeof ROLE_REDIRECTS;
  [key: string]: any;
}

interface NextAuth {
  token?: NextAuthToken;
  [key: string]: any;
}

interface MiddlewareRequest {
  nextUrl: URL & { pathname: string };
  nextauth?: NextAuth;
  url: string;
  [key: string]: any;
}

export function middleware(req: MiddlewareRequest) {
  const url = req.nextUrl;
  const token = (req as MiddlewareRequest).nextauth?.token;

  // When hitting `/`, redirect based on role
  if (url.pathname === "/") {
    if (token?.role && ROLE_REDIRECTS[token.role]) {
      return NextResponse.redirect(new URL(ROLE_REDIRECTS[token.role], req.url));
    }
    // if not logged in → signin
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/manager/:path*",
    "/member/:path*",
    "/api/:path*",
  ],
};
