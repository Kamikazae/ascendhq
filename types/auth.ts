import { DefaultSession, DefaultUser, Session } from "next-auth"
import { JWT } from "next-auth/jwt"

// Define role types as union types instead of strings
export type UserRole = "ADMIN" | "MANAGER" | "MEMBER"

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }
  
  interface User extends DefaultUser {
    id: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}

// Utility types for authentication checks
export type AuthenticatedSession = {
  user: {
    id: string
    role: UserRole
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export type SessionWithUser = Session & {
  user: NonNullable<Session["user"]>
}

// Type guards for authentication
export function isAuthenticated(session: Session | null): session is SessionWithUser {
  return !!session?.user
}

export function hasRole(session: Session | null, role: UserRole): boolean {
  return isAuthenticated(session) && session.user.role === role
}

export function isAdmin(session: Session | null): boolean {
  return hasRole(session, "ADMIN")
}

export function isManager(session: Session | null): boolean {
  return hasRole(session, "MANAGER")
}

export function isMember(session: Session | null): boolean {
  return hasRole(session, "MEMBER")
}

// Utility type for role-based access control
export type RoleBasedAccess<T = any> = {
  [K in UserRole]?: T
}