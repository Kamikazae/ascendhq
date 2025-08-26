import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface TeamProgressReport {
  teamName: string;
  totalObjectives: number;
  completedObjectives: number;
  averageProgress: number;
  status: "On Track" | "At Risk" | "Off Track";
  lastUpdate: string;
  memberCount: number;
}

/**
 * GET /api/admin/progress-reports/teams
 * 
 * Retrieves team progress reports for admin oversight
 * Requires ADMIN role authentication
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const teams = await prisma.team.findMany({
      include: {
        members: {
          select: {
            id: true
          }
        },
        objectives: {
          include: {
            keyResults: {
              select: {
                progress: true,
                updates: {
                  select: {
                    createdAt: true
                  },
                  orderBy: {
                    createdAt: 'desc'
                  },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const teamReports: TeamProgressReport[] = teams.map(team => {
      const totalObjectives = team.objectives.length;
      
      // Calculate average progress
      let totalProgress = 0;
      let progressCount = 0;
      let completedObjectives = 0;
      let lastUpdateDate = new Date(0); // Start with epoch

      team.objectives.forEach(objective => {
        let objectiveProgress = 0;
        let objectiveProgressCount = 0;

        objective.keyResults.forEach(keyResult => {
          totalProgress += keyResult.progress;
          progressCount++;
          objectiveProgress += keyResult.progress;
          objectiveProgressCount++;

          // Find the most recent update
          if (keyResult.updates.length > 0) {
            const updateDate = new Date(keyResult.updates[0].createdAt);
            if (updateDate > lastUpdateDate) {
              lastUpdateDate = updateDate;
            }
          }
        });

        // Consider objective completed if average progress >= 100%
        if (objectiveProgressCount > 0) {
          const avgObjectiveProgress = objectiveProgress / objectiveProgressCount;
          if (avgObjectiveProgress >= 100) {
            completedObjectives++;
          }
        }
      });

      const averageProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

      // Determine status
      let status: "On Track" | "At Risk" | "Off Track" = "On Track";
      if (averageProgress < 40) {
        status = "Off Track";
      } else if (averageProgress < 70) {
        status = "At Risk";
      }

      return {
        teamName: team.name,
        totalObjectives,
        completedObjectives,
        averageProgress,
        status,
        lastUpdate: lastUpdateDate.getTime() > 0 ? lastUpdateDate.toISOString() : new Date().toISOString(),
        memberCount: team.members.length
      };
    });

    return NextResponse.json(teamReports);
  } catch (error) {
    console.error("Error fetching team progress reports:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}