import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!requireAuth(session)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!requireManager(session)) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    const managerId = session!.user.id;

    // Get all teams managed by this manager
    const managedTeams = await prisma.teamMember.findMany({
      where: {
        userId: managerId,
        role: "MANAGER",
      },
      select: {
        teamId: true,
      },
    });

    const teamIds = managedTeams.map((t) => t.teamId);

    if (teamIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get all members of those teams, including their contributions
    const members = await prisma.teamMember.findMany({
      where: {
        teamId: { in: teamIds },
      },
      include: {
        user: {
          include: {
            updates: {
              include: {
                keyResult: {
                  select: {
                    title: true,
                    objective: {
                      select: {
                        title: true,
                        team: {
                          select: { name: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        team: true,
      },
    });

    // Format response
    const formatted = members.map((m) => ({
      id: m.id,
      teamId: m.teamId,
      teamName: m.team.name,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      contributions: m.user.updates.map((u) => ({
        id: u.id,
        newValue: u.newValue,
        comment: u.comment,
        createdAt: u.createdAt,
        keyResultTitle: u.keyResult.title,
        objectiveTitle: u.keyResult.objective.title,
        teamName: u.keyResult.objective.team.name,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching manager members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
