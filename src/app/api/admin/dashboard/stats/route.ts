import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface DashboardStats {
  totalUsers: number;
  totalManagers: number;
  totalMembers: number;
  totalTeams: number;
  activeObjectives: number;
  completedObjectives: number;
  overallProgress: number;
  recentActivity: number;
  healthScore: "Excellent" | "Good" | "Fair" | "Poor";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get user counts
    const [totalUsers, totalManagers, totalMembers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "MANAGER" } }),
      prisma.user.count({ where: { role: "MEMBER" } })
    ]);

    // Get team count
    const totalTeams = await prisma.team.count();

    // Get objective stats
    const [activeObjectives, completedObjectives, allObjectives] = await Promise.all([
      prisma.objective.count({ where: { status: { in: ["ON_TRACK", "AT_RISK"] } } }),
      prisma.objective.count({ where: { status: "OFF_TRACK" } }),
      prisma.objective.findMany({
        include: {
          keyResults: {
            select: {
              progress: true
            }
          }
        }
      })
    ]);

    // Calculate overall progress
    let totalProgress = 0;
    let progressCount = 0;
    allObjectives.forEach(obj => {
      obj.keyResults.forEach(kr => {
        totalProgress += kr.progress;
        progressCount++;
      });
    });
    const overallProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = await prisma.progressUpdate.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Calculate health score
    let healthScore: "Excellent" | "Good" | "Fair" | "Poor" = "Poor";
    if (overallProgress >= 80) healthScore = "Excellent";
    else if (overallProgress >= 60) healthScore = "Good";
    else if (overallProgress >= 40) healthScore = "Fair";

    const stats: DashboardStats = {
      totalUsers,
      totalManagers,
      totalMembers,
      totalTeams,
      activeObjectives,
      completedObjectives,
      overallProgress,
      recentActivity,
      healthScore
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}