import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// TypeScript interfaces for objectives response data
interface KeyResultData {
  id: string;
  title: string;
  progress: number;
  target: number;
  current: number;
}

interface ObjectiveWithDetails {
  id: string;
  title: string;
  description: string;
  progress: number;
  teamId: string;
  teamName: string;
  keyResults: KeyResultData[];
}

interface MyObjectivesResponse {
  objectives: ObjectiveWithDetails[];
}

interface ErrorResponse {
  error: string;
  message?: string;
}

// Progress calculation function for objectives
function calculateObjectiveProgress(keyResults: Array<{ progress: number }>): number {
  // Handle edge case: no key results
  if (!keyResults || keyResults.length === 0) {
    return 0;
  }

  // Filter out invalid progress values and handle edge cases
  const validKeyResults = keyResults.filter(kr => {
    const progress = kr.progress;
    // Check for valid number and not NaN
    return typeof progress === 'number' && !isNaN(progress) && isFinite(progress);
  });

  // Handle edge case: no valid key results after filtering
  if (validKeyResults.length === 0) {
    return 0;
  }

  // Calculate average progress of all valid key results for this objective
  const totalProgress = validKeyResults.reduce((sum, keyResult) => {
    // Ensure each progress value is within 0-100 range before summing
    const normalizedProgress = Math.max(0, Math.min(100, keyResult.progress));
    return sum + normalizedProgress;
  }, 0);
  
  const averageProgress = totalProgress / validKeyResults.length;
  
  // Ensure final progress is between 0-100 and rounded to nearest integer
  return Math.round(Math.max(0, Math.min(100, averageProgress)));
}

/**
 * GET /api/member/my-objectives
 * 
 * Returns detailed objectives data for authenticated member users.
 * 
 * @returns {MyObjectivesResponse} Objectives data including:
 *   - objectives: Array of objectives with details, progress, and key results
 * 
 * @throws {401} Unauthorized - No valid session
 * @throws {403} Forbidden - User is not a MEMBER
 * @throws {500} Internal Server Error - Database or server errors
 * @throws {503} Service Unavailable - Database connection issues
 */
export async function GET() {
  // Session authentication check using NextAuth
  const session = await getServerSession(authOptions);

  // Check if user is authenticated (requirement 4.4)
  if (!session?.user) {
    return NextResponse.json(
      { 
        error: "Unauthorized", 
        message: "Authentication required to access objectives data." 
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
    // Get detailed objectives with key results for teams where user is a member (requirement 4.1, 4.3)
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
        keyResults: {
          orderBy: { dueDate: 'asc' }
        },
        team: {
          select: { id: true, name: true }
        }
      },
      orderBy: { dueDate: 'desc' }
    });

    // Format response data to match frontend expectations (requirement 4.2)
    const formattedObjectives: ObjectiveWithDetails[] = userObjectives.map(objective => {
      // Handle edge cases for invalid key result values from database
      const keyResults: KeyResultData[] = objective.keyResults.map((kr: {
        id: string;
        title: string;
        progress: number;
        targetValue: number;
        currentValue: number;
      }) => ({
        id: kr.id,
        title: kr.title || "",
        progress: typeof kr.progress === 'number' && !isNaN(kr.progress) ? Math.max(0, Math.min(100, kr.progress)) : 0,
        target: typeof kr.targetValue === 'number' && !isNaN(kr.targetValue) ? kr.targetValue : 0,
        current: typeof kr.currentValue === 'number' && !isNaN(kr.currentValue) ? kr.currentValue : 0
      }));

      return {
        id: objective.id,
        title: objective.title,
        description: objective.description || "",
        progress: calculateObjectiveProgress(objective.keyResults),
        teamId: objective.team.id,
        teamName: objective.team.name,
        keyResults
      };
    });

    // Structure response data following Next.js API route patterns (requirement 6.4)
    const response: MyObjectivesResponse = {
      objectives: formattedObjectives
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
    console.error("My objectives API error:", error);
    
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
            message: "Failed to retrieve objectives data due to database error." 
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
            message: "Insufficient permissions to access objectives data." 
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
        message: "An unexpected error occurred while fetching objectives data." 
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