import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// TypeScript interfaces for request/response
interface RecentObjective {
  id: string;
  title: string;
  status: string;
  progress: number;
  teamName: string;
}

interface ProgressBreakdown {
  category: string;
  progress: number;
}

interface MemberDashboardStats {
  objectives: number;
  completed: number;
  teams: number;
  progress: number;
  recentObjectives: RecentObjective[];
  breakdown: ProgressBreakdown[];
}

interface ErrorResponse {
  error: string;
  message?: string;
}

// Interface for objective with key results
interface ObjectiveWithKeyResults {
  id: string;
  keyResults: Array<{
    id: string;
    progress: number;
  }>;
}

// Progress calculation functions
function calculateObjectiveCompletion(objective: ObjectiveWithKeyResults): number {
  // Handle edge case: no key results
  if (!objective.keyResults || objective.keyResults.length === 0) {
    return 0;
  }

  // Calculate average progress of all key results for this objective
  const totalProgress = objective.keyResults.reduce((sum, keyResult) => sum + keyResult.progress, 0);
  const averageProgress = totalProgress / objective.keyResults.length;
  
  return averageProgress;
}

function calculateOverallProgress(objectives: ObjectiveWithKeyResults[]): number {
  // Handle edge case: no objectives
  if (!objectives || objectives.length === 0) {
    return 0;
  }

  // Calculate progress for each objective and sum them up
  const totalProgress = objectives.reduce((sum, objective) => {
    return sum + calculateObjectiveCompletion(objective);
  }, 0);

  // Handle edge case: division by zero (though already handled above)
  if (objectives.length === 0) {
    return 0;
  }

  // Calculate overall progress percentage and round to nearest integer
  const overallProgress = totalProgress / objectives.length;
  return Math.round(Math.max(0, Math.min(100, overallProgress))); // Clamp between 0-100
}

function countCompletedObjectives(objectives: ObjectiveWithKeyResults[]): number {
  // Handle edge case: no objectives
  if (!objectives || objectives.length === 0) {
    return 0;
  }

  return objectives.reduce((count, objective) => {
    const objectiveProgress = calculateObjectiveCompletion(objective);
    // Consider objective completed if progress >= 100%
    return objectiveProgress >= 100 ? count + 1 : count;
  }, 0);
}

/**
 * GET /api/member/dashboard
 * 
 * Returns dashboard statistics for authenticated member users.
 * 
 * @returns {MemberDashboardStats} Dashboard statistics including:
 *   - objectives: Total number of objectives across user's teams
 *   - completed: Number of completed objectives (100% progress)
 *   - teams: Number of teams user belongs to
 *   - progress: Overall progress percentage (0-100)
 *   - recentObjectives: Array of recent objectives with status and team info
 *   - breakdown: Array of progress breakdown by team
 * 
 * @throws {401} Unauthorized - No valid session
 * @throws {403} Forbidden - User is not a MEMBER
 * @throws {500} Internal Server Error - Database or server errors
 * @throws {503} Service Unavailable - Database connection issues
 */
export async function GET() {
  // Session authentication check using NextAuth
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json(
      { 
        error: "Unauthorized", 
        message: "Authentication required to access dashboard data." 
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

  // Check if user has MEMBER role (requirement 2.2)
  if (session.user.role !== "MEMBER") {
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
    // Efficient single-query approach to get all user's objectives with key results and teams
    // This query gets objectives for teams where the user is a member
    const userObjectives = await prisma.objective.findMany({
      where: {
        team: {
          members: {
            some: { 
              userId: session.user.id 
            }
          }
        }
      },
      include: {
        keyResults: true,
        team: {
          include: {
            members: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });

    // Get count of teams user belongs to with a separate optimized query
    const userTeamsCount = await prisma.teamMember.count({
      where: {
        userId: session.user.id
      }
    });

    // Calculate statistics using the dedicated progress calculation functions
    const totalObjectives = userObjectives.length;
    const completedObjectives = countCompletedObjectives(userObjectives);
    const overallProgress = calculateOverallProgress(userObjectives);

    // Get recent objectives (last 3 objectives ordered by creation date)
    const recentObjectives: RecentObjective[] = userObjectives
      .slice(0, 3)
      .map(obj => {
        const progress = calculateObjectiveCompletion(obj);
        let status = "Not Started";
        if (progress >= 100) status = "Completed";
        else if (progress > 0) status = "In Progress";
        
        return {
          id: obj.id,
          title: obj.title,
          status,
          progress,
          teamName: obj.team.name || "Unknown Team"
        };
      });

    // Calculate progress breakdown by team
    const teamProgressMap = new Map<string, { total: number, count: number }>();
    
    userObjectives.forEach(obj => {
      const teamName = obj.team.name || "Unknown Team";
      const progress = calculateObjectiveCompletion(obj);
      
      if (!teamProgressMap.has(teamName)) {
        teamProgressMap.set(teamName, { total: 0, count: 0 });
      }
      
      const teamData = teamProgressMap.get(teamName)!;
      teamData.total += progress;
      teamData.count += 1;
    });

    const breakdown: ProgressBreakdown[] = Array.from(teamProgressMap.entries())
      .map(([teamName, data]) => ({
        category: teamName,
        progress: data.count > 0 ? Math.round(data.total / data.count) : 0
      }))
      .slice(0, 3); // Limit to top 3 teams

    // Validate calculated values to ensure data integrity
    const validatedStats = {
      objectives: Math.max(0, totalObjectives),
      completed: Math.max(0, Math.min(completedObjectives, totalObjectives)),
      teams: Math.max(0, userTeamsCount),
      progress: Math.max(0, Math.min(100, overallProgress))
    };

    // Structure response data to match frontend expectations
    const dashboardStats: MemberDashboardStats = {
      objectives: validatedStats.objectives,
      completed: validatedStats.completed,
      teams: validatedStats.teams,
      progress: validatedStats.progress,
      recentObjectives,
      breakdown
    };

    // Return properly formatted JSON response with success status
    return NextResponse.json(dashboardStats, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error("Member dashboard API error:", error);
    
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
            message: "Failed to retrieve dashboard data due to database error." 
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
            message: "Insufficient permissions to access dashboard data." 
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
        message: "An unexpected error occurred while fetching dashboard data." 
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