import { Session } from "next-auth"
import { UserRole, SessionWithUser } from "../../types/auth"

/**
 * Type guard to check if a session is authenticated
 * @param session - The session object to check
 * @returns True if session exists and has a user, false otherwise
 */
export function requireAuth(session: Session | null): session is SessionWithUser {
  return !!session?.user
}

/**
 * Check if an authenticated session has a specific role
 * @param session - The session object to check
 * @param role - The required role
 * @returns True if session is authenticated and has the required role
 */
export function requireRole(session: Session | null, role: UserRole): boolean {
  return requireAuth(session) && session.user.role === role
}

/**
 * Check if session has admin role
 * @param session - The session object to check
 * @returns True if session is authenticated and user is an admin
 */
export function requireAdmin(session: Session | null): boolean {
  return requireRole(session, "ADMIN")
}

/**
 * Check if session has manager role
 * @param session - The session object to check
 * @returns True if session is authenticated and user is a manager
 */
export function requireManager(session: Session | null): boolean {
  return requireRole(session, "MANAGER")
}

/**
 * Check if session has member role
 * @param session - The session object to check
 * @returns True if session is authenticated and user is a member
 */
export function requireMember(session: Session | null): boolean {
  return requireRole(session, "MEMBER")
}

/**
 * Check if session has admin or manager role (elevated permissions)
 * @param session - The session object to check
 * @returns True if session is authenticated and user is admin or manager
 */
export function requireElevatedRole(session: Session | null): boolean {
  return requireAdmin(session) || requireManager(session)
}

/**
 * Get the user ID from an authenticated session
 * @param session - The session object
 * @returns User ID if session is authenticated, null otherwise
 */
export function getUserId(session: Session | null): string | null {
  return requireAuth(session) ? session.user.id : null
}

/**
 * Get the user role from an authenticated session
 * @param session - The session object
 * @returns User role if session is authenticated, null otherwise
 */
export function getUserRole(session: Session | null): UserRole | null {
  return requireAuth(session) ? session.user.role : null
}

/**
 * Throw an error if session is not authenticated
 * @param session - The session object to check
 * @throws Error if session is not authenticated
 */
export function assertAuth(session: Session | null): asserts session is SessionWithUser {
  if (!requireAuth(session)) {
    throw new Error("Authentication required")
  }
}

/**
 * Throw an error if session doesn't have the required role
 * @param session - The session object to check
 * @param role - The required role
 * @throws Error if session doesn't have the required role
 */
export function assertRole(session: Session | null, role: UserRole): asserts session is SessionWithUser {
  assertAuth(session)
  if (!requireRole(session, role)) {
    throw new Error(`Role ${role} required`)
  }
}