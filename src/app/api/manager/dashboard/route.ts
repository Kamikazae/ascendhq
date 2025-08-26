import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the team where the logged-in user is MANAGER
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        role: "MANAGER",
      },
      include: {
        team: {
          include: {
            objectives: {
              include: {
                keyResults: {
                  include: {
                    updates: {
                      orderBy: { createdAt: "desc" },
                      include: {
                        user: { select: { id: true, name: true } },
                      },
                    },
                  },
                },
              },
            },
            members: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!teamMember?.team) {
      return NextResponse.json(
        { error: "No team found for this manager" },
        { status: 404 }
      );
    }

    const team = teamMember.team;

    // Calculate completion % based on Objectives
    const totalObjectives = team.objectives.length;
    const completedObjectives = team.objectives.filter(
      (o) => o.status === "ON_TRACK" // <-- corrected
    ).length;

    const completion =
      totalObjectives > 0
        ? Math.round((completedObjectives / totalObjectives) * 100)
        : 0;

    // Collect & sort recent updates globally
    const recentUpdates = team.objectives
      .flatMap((o) =>
        o.keyResults.flatMap((kr) =>
          kr.updates.map((u) => ({
            id: u.id,
            member: u.user?.name ?? "Unknown",
            comment: u.comment,
            date: u.createdAt.toISOString(),
          }))
        )
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json({
      teamName: team.name,
      completion,
      objectives: team.objectives.map((o) => ({
        id: o.id,
        title: o.title,
        status: o.status,
      })),
    recentUpdates: recentUpdates.map((u) => ({
    id: u.id,
    date: u.date,
    comment: u.comment,
  })),
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
