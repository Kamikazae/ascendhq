import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface TeamWithDetails {
  id: string;
  name: string;
  memberCount: number;
  managerName: string;
  managerId?: string;
  objectiveCount: number;
  averageProgress: number;
  status: "On Track" | "At Risk" | "Off Track";
  members: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  createdDate: string;
}

/**
 * GET /api/admin/manage-teams
 * 
 * Retrieves all teams with detailed information for admin management
 * Requires ADMIN role authentication
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        objectives: {
          include: {
            keyResults: {
              select: {
                progress: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const teamsWithDetails: TeamWithDetails[] = teams.map(team => {
      // Find manager
      const manager = team.members.find(m => m.role === "MANAGER");
      
      // Calculate average progress
      let totalProgress = 0;
      let progressCount = 0;
      team.objectives.forEach(obj => {
        obj.keyResults.forEach(kr => {
          totalProgress += kr.progress;
          progressCount++;
        });
      });
      const averageProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

      // Determine status
      let status: "On Track" | "At Risk" | "Off Track" = "On Track";
      if (averageProgress < 40) status = "Off Track";
      else if (averageProgress < 70) status = "At Risk";

      // Format members
      const members = team.members.map(member => ({
        id: member.user.id,
        name: member.user.name || "Unknown User",
        role: member.role
      }));

      return {
        id: team.id,
        name: team.name,
        memberCount: team.members.length,
        managerName: manager?.user.name || "No Manager",
        managerId: manager?.user.id,
        objectiveCount: team.objectives.length,
        averageProgress,
        status,
        members,
        createdDate: new Date().toISOString() // Using current date since createdAt doesn't exist
      };
    });

    return NextResponse.json(teamsWithDetails);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/manage-teams
 * 
 * Creates a new team
 * Requires ADMIN role authentication
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, managerId, memberIds } = body;

    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    // Check if team name already exists
    const existingTeam = await prisma.team.findFirst({
      where: { name }
    });
    if (existingTeam) {
      return NextResponse.json({ error: "Team with this name already exists" }, { status: 409 });
    }

    // Create team
    const newTeam = await prisma.team.create({
      data: { name }
    });

    // Add manager if specified
    if (managerId) {
      await prisma.teamMember.create({
        data: {
          userId: managerId,
          teamId: newTeam.id,
          role: "MANAGER"
        }
      });
    }

    // Add members if specified
    if (memberIds && Array.isArray(memberIds)) {
      const memberPromises = memberIds.map((memberId: string) =>
        prisma.teamMember.create({
          data: {
            userId: memberId,
            teamId: newTeam.id,
            role: "MEMBER"
          }
        })
      );
      await Promise.all(memberPromises);
    }

    return NextResponse.json({ 
      message: "Team created successfully",
      teamId: newTeam.id 
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/manage-teams
 * 
 * Updates an existing team
 * Requires ADMIN role authentication
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { teamId, name, managerId, memberIds } = body;

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    // Update team name if provided
    if (name) {
      await prisma.team.update({
        where: { id: teamId },
        data: { name }
      });
    }

    // Update manager if specified
    if (managerId) {
      // Remove existing manager
      await prisma.teamMember.deleteMany({
        where: { 
          teamId,
          role: "MANAGER"
        }
      });
      // Add new manager
      await prisma.teamMember.create({
        data: {
          userId: managerId,
          teamId,
          role: "MANAGER"
        }
      });
    }

    // Update members if specified
    if (memberIds && Array.isArray(memberIds)) {
      // Remove existing members (but keep manager)
      await prisma.teamMember.deleteMany({
        where: { 
          teamId,
          role: "MEMBER"
        }
      });
      // Add new members
      const memberPromises = memberIds.map((memberId: string) =>
        prisma.teamMember.create({
          data: {
            userId: memberId,
            teamId,
            role: "MEMBER"
          }
        })
      );
      await Promise.all(memberPromises);
    }

    return NextResponse.json({ 
      message: "Team updated successfully" 
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/manage-teams
 * 
 * Deletes a team
 * Requires ADMIN role authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    // Check if team has active objectives
    const objectives = await prisma.objective.findMany({
      where: { teamId }
    });

    if (objectives.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete team with active objectives. Please reassign or complete objectives first." },
        { status: 400 }
      );
    }

    // Delete team (this will cascade delete team members)
    await prisma.team.delete({
      where: { id: teamId }
    });

    return NextResponse.json({ 
      message: "Team deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}