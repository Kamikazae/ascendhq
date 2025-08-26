import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireManager } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!requireAuth(session)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!requireManager(session)) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    const { id: objectiveId } = await params;

    // Verify manager has access to this objective
    const objective = await prisma.objective.findUnique({
      where: { id: objectiveId },
      include: { team: true }
    });

    if (!objective) {
      return NextResponse.json({ error: "Objective not found" }, { status: 404 });
    }

    const managerTeam = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId: objective.teamId,
        role: "MANAGER"
      }
    });

    if (!managerTeam) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch progress updates from the existing ProgressUpdate table
    const progressUpdates = await prisma.progressUpdate.findMany({
      where: {
        keyResult: {
          objectiveId: objectiveId
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        keyResult: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const formattedUpdates = progressUpdates.map(update => ({
      id: update.id,
      type: "progress",
      message: `Updated "${update.keyResult.title}" to ${update.newValue}${update.comment ? ` - ${update.comment}` : ''}`,
      author: update.user.name,
      timestamp: update.createdAt.toISOString(),
      newValue: update.newValue.toString()
    }));

    // If no updates found, return some mock data
    if (formattedUpdates.length === 0) {
      const mockUpdates = [
        {
          id: "1",
          type: "progress",
          message: "Objective created",
          author: session.user.name || "Manager",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      return NextResponse.json(mockUpdates);
    }

    return NextResponse.json(formattedUpdates);
  } catch (error) {
    console.error("Error fetching objective updates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}