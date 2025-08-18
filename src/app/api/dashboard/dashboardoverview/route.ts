// /app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Total counts
    const totalObjectives = await prisma.objective.count();
    const totalKeyResults = await prisma.keyResult.count();

    // Average progress %
    const keyResults = await prisma.keyResult.findMany({
      select: { progress: true }
    });
    const avgProgress =
      keyResults.length > 0
        ? Math.round(
            keyResults.reduce((sum, kr) => sum + kr.progress, 0) / keyResults.length
          )
        : 0;

    // Team members count
    const teamMembersCount = await prisma.user.count();

    // Progress over time (grouped by day)
    const updates = await prisma.progressUpdate.findMany({
      select: { createdAt: true },
    });
    const progressOverTime = updates.reduce((acc, update) => {
      const date = update.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const progressOverTimeArray = Object.entries(progressOverTime).map(
      ([date, count]) => ({ date, count })
    );

    // Recent activity
    const recentActivity = await prisma.progressUpdate.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        keyResult: { select: { title: true } },
      },
    });

    // Top performing objectives
    const topObjectives = await prisma.objective.findMany({
      include: {
        keyResults: { select: { progress: true } },
      },
    });

    const topPerformingObjectives = topObjectives
      .map((obj) => ({
        id: obj.id,
        title: obj.title,
        avgProgress:
          obj.keyResults.length > 0
            ? Math.round(
                obj.keyResults.reduce((sum, kr) => sum + kr.progress, 0) /
                  obj.keyResults.length
              )
            : 0,
      }))
      .sort((a, b) => b.avgProgress - a.avgProgress)
      .slice(0, 5);

    return NextResponse.json({
      totalObjectives,
      totalKeyResults,
      avgProgress,
      teamMembersCount,
      progressOverTime: progressOverTimeArray,
      recentActivity,
      topPerformingObjectives,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
