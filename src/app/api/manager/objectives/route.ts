import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";// adjust path if needed
import {prisma} from "@/lib/prisma"; // make sure you have prisma client setup

// GET /api/manager/objectives
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all objectives where the manager's teams are involved
    const objectives = await prisma.objective.findMany({
      where: {
        team: {
          members: {
            some: {
              userId: session.user.id,
              role: "MANAGER",
            },
          },
        },
      },
      include: {
        keyResults: {
          include: {
            updates: true,
          },
        },
      },
    });

    // Transform data for frontend (similar shape to your mockObjectives)
    const formatted = objectives.map((obj) => {
      const progress =
        obj.keyResults.length > 0
          ? Math.round(
              obj.keyResults.reduce((acc, kr) => acc + kr.progress, 0) /
                obj.keyResults.length
            )
          : 0;

      return {
        id: obj.id,
        title: obj.title,
        status: obj.status,
        keyResults: obj.keyResults.length,
        progress,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching objectives:", error);
    return NextResponse.json(
      { error: "Failed to fetch objectives" },
      { status: 500 }
    );
  }
}
