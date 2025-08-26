import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireManager } from "@/lib/auth-utils";

interface NewKeyResult {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
}

interface NewObjective {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  keyResults: NewKeyResult[];
}

/**
 * GET /api/manager/objectives
 * 
 * Retrieves objectives for the manager's team
 * Requires MANAGER role authentication
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!requireAuth(session)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!requireManager(session)) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    // Get the manager's team(s)
    const managerTeams = await prisma.teamMember.findMany({
      where: {
        userId: session.user.id,
        role: "MANAGER"
      },
      include: {
        team: {
          include: {
            objectives: {
              include: {
                keyResults: {
                  select: {
                    id: true,
                    title: true,
                    progress: true,
                    targetValue: true,
                    currentValue: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Flatten objectives from all teams the manager leads
    const objectives = managerTeams.flatMap(teamMember => 
      teamMember.team.objectives.map(objective => ({
        id: objective.id,
        title: objective.title,
        description: objective.description,
        status: objective.status,
        keyResults: objective.keyResults.map(kr => ({
          id: kr.id,
          title: kr.title,
          progress: kr.progress,
          target: kr.targetValue,
          current: kr.currentValue
        })),
        progress: objective.keyResults.length > 0 
          ? Math.round(objective.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / objective.keyResults.length)
          : 0,
        dueDate: objective.dueDate.toISOString(),
        teamName: teamMember.team.name,
        createdAt: new Date().toISOString() // Using current date since createdAt doesn't exist
      }))
    );

    return NextResponse.json(objectives);
  } catch (error) {
    console.error("Error fetching manager objectives:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/manager/objectives
 * 
 * Creates a new objective for the manager's team
 * Requires MANAGER role authentication
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!requireAuth(session)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!requireManager(session)) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate, dueDate, keyResults }: NewObjective = body;

    // Validate required fields
    if (!title || !startDate || !endDate || !dueDate || !keyResults || keyResults.length === 0) {
      return NextResponse.json(
        { error: "Title, dates, and at least one key result are required" },
        { status: 400 }
      );
    }

    // Get the manager's primary team
    const managerTeam = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        role: "MANAGER"
      },
      include: {
        team: true
      }
    });

    if (!managerTeam) {
      return NextResponse.json(
        { error: "Manager must be assigned to a team to create objectives" },
        { status: 400 }
      );
    }

    // Create objective with key results in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the objective
      const objective = await tx.objective.create({
        data: {
          title,
          description: description || "",
          teamId: managerTeam.teamId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          dueDate: new Date(dueDate),
          status: "ON_TRACK"
        }
      });

      // Create key results
      const createdKeyResults = await Promise.all(
        keyResults.map(kr => 
          tx.keyResult.create({
            data: {
              title: kr.title,
              targetValue: kr.targetValue,
              currentValue: kr.currentValue,
              progress: kr.targetValue > 0 ? Math.round((kr.currentValue / kr.targetValue) * 100) : 0,
              objectiveId: objective.id,
              dueDate: new Date(dueDate) // Use objective due date for key results
            }
          })
        )
      );

      return { objective, keyResults: createdKeyResults };
    });

    return NextResponse.json({
      message: "Objective created successfully",
      objectiveId: result.objective.id,
      keyResultsCount: result.keyResults.length
    });
  } catch (error) {
    console.error("Error creating objective:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}