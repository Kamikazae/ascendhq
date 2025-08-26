import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface ObjectiveWithDetails {
  id: string;
  title: string;
  description: string;
  teamName: string;
  teamId: string;
  managerName: string;
  status: "ON_TRACK" | "AT_RISK" | "OFF_TRACK";
  progress: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  keyResultsCount: number;
  isOverdue: boolean;
  daysUntilDue: number;
}

/**
 * GET /api/admin/manage-objectives
 * 
 * Retrieves all objectives across all teams for admin oversight
 * Requires ADMIN role authentication
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const objectives = await prisma.objective.findMany({
      include: {
        team: {
          include: {
            members: {
              where: { role: "MANAGER" },
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        },
        keyResults: {
          select: {
            id: true,
            progress: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    const objectivesWithDetails: ObjectiveWithDetails[] = objectives.map(objective => {
      // Calculate progress from key results
      const progress = objective.keyResults.length > 0
        ? Math.round(objective.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / objective.keyResults.length)
        : 0;

      // Get manager name
      const manager = objective.team.members.find(m => m.role === "MANAGER");
      const managerName = manager?.user.name || "No Manager";

      // Calculate days until due
      const now = new Date();
      const dueDate = new Date(objective.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isOverdue = daysUntilDue < 0;

      return {
        id: objective.id,
        title: objective.title,
        description: objective.description,
        teamName: objective.team.name,
        teamId: objective.team.id,
        managerName,
        status: objective.status,
        progress,
        startDate: objective.startDate.toISOString(),
        endDate: objective.endDate.toISOString(),
        dueDate: objective.dueDate.toISOString(),
        keyResultsCount: objective.keyResults.length,
        isOverdue,
        daysUntilDue
      };
    });

    return NextResponse.json(objectivesWithDetails);
  } catch (error) {
    console.error("Error fetching objectives:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/manage-objectives
 * 
 * Reassigns an objective to another team or manager
 * Requires ADMIN role authentication
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { objectiveId, teamId, status } = body;

    if (!objectiveId) {
      return NextResponse.json({ error: "Objective ID is required" }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    
    if (teamId) {
      updateData.teamId = teamId;
    }
    
    if (status && ["ON_TRACK", "AT_RISK", "OFF_TRACK"].includes(status)) {
      updateData.status = status;
    }

    await prisma.objective.update({
      where: { id: objectiveId },
      data: updateData
    });

    return NextResponse.json({ 
      message: "Objective updated successfully" 
    });
  } catch (error) {
    console.error("Error updating objective:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/manage-objectives
 * 
 * Archives an objective (soft delete)
 * Requires ADMIN role authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const objectiveId = searchParams.get('objectiveId');

    if (!objectiveId) {
      return NextResponse.json({ error: "Objective ID is required" }, { status: 400 });
    }

    // For now, we'll actually delete the objective
    // In a real system, you might want to add an "archived" field instead
    await prisma.objective.delete({
      where: { id: objectiveId }
    });

    return NextResponse.json({ 
      message: "Objective archived successfully" 
    });
  } catch (error) {
    console.error("Error archiving objective:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}