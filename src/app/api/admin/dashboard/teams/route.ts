import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface TeamOverview {
  id: string;
  name: string;
  memberCount: number;
  managerName: string;
  objectiveCount: number;
  averageProgress: number;
  status: "On Track" | "At Risk" | "Off Track";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: { select: { name: true } }
          }
        },
        objectives: {
          include: {
            keyResults: {
              select: { progress: true }
            }
          }
        }
      }
    });

    const teamOverviews: TeamOverview[] = teams.map(team => {
      const manager = team.members.find(m => m.role === "MANAGER");
      const memberCount = team.members.length;
      const objectiveCount = team.objectives.length;

      // Calculate average progress
      let totalProgress = 0;
      let progressCount = 0;
      team.objectives.forEach(obj => {
        obj.keyResults.forEach(kr => {
          totalProgress += kr.progress;
          progressCount++;
        });
      });
      const averageProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

      // Determine status
      let status: "On Track" | "At Risk" | "Off Track" = "On Track";
      if (averageProgress < 40) status = "Off Track";
      else if (averageProgress < 70) status = "At Risk";

      return {
        id: team.id,
        name: team.name,
        memberCount,
        managerName: manager?.user.name || "No Manager",
        objectiveCount,
        averageProgress,
        status
      };
    });

    return NextResponse.json(teamOverviews);
  } catch (error) {
    console.error("Error fetching team overviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}