import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface ProgressUpdateWithDetails {
  id: string;
  userName: string;
  userRole: string;
  teamName: string;
  objectiveTitle: string;
  keyResultTitle: string;
  oldValue: number;
  newValue: number;
  comment?: string;
  timestamp: string;
  changeType: "increase" | "decrease" | "no_change";
}

/**
 * GET /api/admin/progress-reports/updates
 * 
 * Retrieves all progress updates with detailed information for admin reports
 * Requires ADMIN role authentication
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const progressUpdates = await prisma.progressUpdate.findMany({
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        },
        keyResult: {
          include: {
            objective: {
              include: {
                team: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to last 100 updates for performance
    });

    const updatesWithDetails: ProgressUpdateWithDetails[] = progressUpdates.map(update => {
      // Calculate change type
      let changeType: "increase" | "decrease" | "no_change" = "no_change";
      
      // We need to get the previous value to calculate change
      // For now, we'll assume the current progress is the new value
      // and calculate based on the update value vs current progress
      const currentProgress = update.keyResult.progress;
      const updateValue = update.newValue;
      
      if (updateValue > currentProgress) {
        changeType = "increase";
      } else if (updateValue < currentProgress) {
        changeType = "decrease";
      }

      return {
        id: update.id,
        userName: update.user.name || "Unknown User",
        userRole: update.user.role,
        teamName: update.keyResult.objective.team.name,
        objectiveTitle: update.keyResult.objective.title,
        keyResultTitle: update.keyResult.title,
        oldValue: currentProgress, // Using current progress as old value for now
        newValue: updateValue,
        comment: update.comment || undefined,
        timestamp: update.createdAt.toISOString(),
        changeType
      };
    });

    return NextResponse.json(updatesWithDetails);
  } catch (error) {
    console.error("Error fetching progress updates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}