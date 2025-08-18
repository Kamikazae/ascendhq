// src/app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 1. Counts
    const totalTeams = await prisma.team.count();
    const totalObjectives = await prisma.objective.count();

    // 2. Recent Teams with member count
    const teams = await prisma.team.findMany({
      take: 5,
      orderBy: { name: "asc" },
      include: {
        members: {
          include: { user: true }
        },
        objectives: true
      }
    });

    // 3. Recent Objectives
    const recentObjectives = await prisma.objective.findMany({
      take: 5,
      orderBy: { startDate: "desc" },
      include: {
        team: true,
        keyResults: true
      }
    });

    // Format team data
    const formattedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      members: team.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        role: m.role
      })),
      objectives: team.objectives.map(obj => ({
        id: obj.id,
        title: obj.title,
        status: obj.status
      }))
    }));

    // Format objectives with completion %
    const formattedObjectives = recentObjectives.map(obj => {
      const totalProgress =
        obj.keyResults.length > 0
          ? obj.keyResults.reduce((sum, kr) => sum + kr.progress, 0) /
            obj.keyResults.length
          : 0;

      return {
        id: obj.id,
        title: obj.title,
        status: obj.status,
        teamName: obj.team.name,
        completion: Math.round(totalProgress)
      };
    });

    return NextResponse.json({
      totalTeams,
      totalObjectives,
      teams: formattedTeams,
      objectives: formattedObjectives
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
