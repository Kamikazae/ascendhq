import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface ProgressSummary {
  totalUpdates: number;
  activeUsers: number;
  averageProgress: number;
  onTrackTeams: number;
  atRiskTeams: number;
  offTrackTeams: number;
}

/**
 * GET /api/admin/progress-reports/summary
 * 
 * Retrieves summary statistics for progress reports
 * Requires ADMIN role authentication
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get total updates count
    const totalUpdates = await prisma.progressUpdate.count();

    // Get active users (users who made updates in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersResult = await prisma.progressUpdate.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });
    const activeUsers = activeUsersResult.length;

    // Calculate average progress across all key results
    const keyResults = await prisma.keyResult.findMany({
      select: {
        progress: true
      }
    });
    const averageProgress = keyResults.length > 0 
      ? Math.round(keyResults.reduce((sum, kr) => sum + kr.progress, 0) / keyResults.length)
      : 0;

    // Get team status counts
    const teams = await prisma.team.findMany({
      include: {
        objectives: {
          include: {
            keyResults: {
              select: {
                progress: true
              }
            }
          }
        }
      }
    });

    let onTrackTeams = 0;
    let atRiskTeams = 0;
    let offTrackTeams = 0;

    teams.forEach(team => {
      // Calculate team average progress
      let totalProgress = 0;
      let progressCount = 0;

      team.objectives.forEach(objective => {
        objective.keyResults.forEach(keyResult => {
          totalProgress += keyResult.progress;
          progressCount++;
        });
      });

      const teamAverageProgress = progressCount > 0 ? totalProgress / progressCount : 0;

      if (teamAverageProgress >= 70) {
        onTrackTeams++;
      } else if (teamAverageProgress >= 40) {
        atRiskTeams++;
      } else {
        offTrackTeams++;
      }
    });

    const summary: ProgressSummary = {
      totalUpdates,
      activeUsers,
      averageProgress,
      onTrackTeams,
      atRiskTeams,
      offTrackTeams
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching progress summary:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}