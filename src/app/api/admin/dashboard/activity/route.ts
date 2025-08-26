import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface ActivityItem {
  id: string;
  type: "progress_update" | "objective_created" | "team_created" | "user_added";
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get recent progress updates
    const recentUpdates = await prisma.progressUpdate.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        keyResult: {
          include: {
            objective: { select: { title: true } }
          }
        }
      }
    });

    const activities: ActivityItem[] = recentUpdates.map(update => ({
      id: update.id,
      type: "progress_update",
      description: `Updated progress on "${update.keyResult.objective.title}" to ${update.newValue}`,
      user: update.user.name || "Unknown User",
      timestamp: update.createdAt.toISOString(),
      metadata: {
        objectiveTitle: update.keyResult.objective.title,
        newValue: update.newValue,
        comment: update.comment
      }
    }));

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}