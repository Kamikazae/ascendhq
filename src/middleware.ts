import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "../types/auth";

const ROLE_REDIRECTS: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  MEMBER: "/member/dashboard",
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Not logged in → go to signin
  if (!token) {
    if (url.pathname !== "/auth/signin") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    return NextResponse.next();
  }

  // If hitting `/`, redirect based on role
  if (url.pathname === "/") {
    const role = token.role as UserRole | undefined;
    if (role && role in ROLE_REDIRECTS) {
      return NextResponse.redirect(new URL(ROLE_REDIRECTS[role], req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/manager/:path*", "/member/:path*"],
};
