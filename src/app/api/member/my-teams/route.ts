import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/auth-utils";

// TypeScript interfaces for teams response data
interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TeamWithMembers {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  objectiveCount: number;
  members: TeamMemberData[];
}

interface MyTeamsResponse {
  teams: TeamWithMembers[];
}

interface ErrorResponse {
  error: string;
  message?: string;
}

/**
 * GET /api/member/my-teams
 * 
 * Returns teams data for authenticated member users.
 * 
 * @returns {MyTeamsResponse} Teams data including:
 *   - teams: Array of teams with member details and statistics
 * 
 * @throws {401} Unauthorized - No valid session
 * @throws {403} Forbidden - User is not a MEMBER
 * @throws {500} Internal Server Error - Database or server errors
 * @throws {503} Service Unavailable - Database connection issues
 */
export async function GET() {
  // Session authentication check using NextAuth
  const session = await getServerSession(authOptions);

  // Check if user is authenticated (requirement 5.4)
  if (!session?.user) {
    return NextResponse.json(
      { 
        error: "Unauthorized", 
        message: "Authentication required to access teams data." 
      } as ErrorResponse,
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer'
        }
      }
    );
  }

  // Check if user has MEMBER role (requirement 6.1)
  if (!requireMember(session)) {
    return NextResponse.json(
      { 
        error: "Forbidden", 
        message: "Access restricted to members only. Current role does not have permission." 
      } as ErrorResponse,
      { 
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  try {
    // Get teams with member details and statistics for teams where user is a member (requirement 5.1, 5.3)
    const userTeams = await prisma.team.findMany({
      where: {
        members: {
          some: { 
            userId: session.user.id 
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { 
                id: true, 
                name: true, 
                email: true 
              }
            }
          }
        },
        _count: {
          select: { 
            objectives: true 
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Format response data to match frontend expectations (requirement 5.2)
    const formattedTeams: TeamWithMembers[] = userTeams.map(team => {
      // Format team members data
      const members: TeamMemberData[] = team.members.map(member => ({
        id: member.user.id,
        name: member.user.name || "",
        email: member.user.email || "",
        role: member.role || "MEMBER"
      }));

      return {
        id: team.id,
        name: team.name || "",
        description: "", // Team description not in current schema, using empty string
        memberCount: team.members.length,
        objectiveCount: team._count.objectives,
        members
      };
    });

    // Structure response data following Next.js API route patterns (requirement 6.4)
    const response: MyTeamsResponse = {
      teams: formattedTeams
    };

    // Return properly formatted JSON response with consistent error handling (requirement 6.3)
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error("My teams API error:", error);
    
    // Comprehensive error handling with proper status codes
    if (error instanceof Error) {
      // Database connection errors - Service Unavailable
      if (error.message.includes('connect') || 
          error.message.includes('timeout') || 
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ENOTFOUND')) {
        return NextResponse.json(
          { 
            error: "Service Unavailable", 
            message: "Database connection failed. Please try again later." 
          } as ErrorResponse,
          { 
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '30'
            }
          }
        );
      }
      
      // Prisma/Database query errors - Internal Server Error
      if (error.message.includes('Prisma') || 
          error.message.includes('Invalid') ||
          error.message.includes('constraint')) {
        return NextResponse.json(
          { 
            error: "Database Error", 
            message: "Failed to retrieve teams data due to database error." 
          } as ErrorResponse,
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Permission/Access errors - Forbidden
      if (error.message.includes('permission') || 
          error.message.includes('access') ||
          error.message.includes('forbidden')) {
        return NextResponse.json(
          { 
            error: "Access Denied", 
            message: "Insufficient permissions to access teams data." 
          } as ErrorResponse,
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }
    
    // Generic server error for any unhandled cases
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: "An unexpected error occurred while fetching teams data." 
      } as ErrorResponse,
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}