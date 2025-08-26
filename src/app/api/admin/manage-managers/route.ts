import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

// TypeScript interfaces matching the frontend expectations
interface ManagerWithDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  team: string;
  teamMembers: number;
  objectives: number;
  lastActive: string;
  joinedDate: string;
}

/**
 * GET /api/admin/manage-managers
 * 
 * Retrieves all managers in the system for admin oversight
 * Requires ADMIN role authentication
 * 
 * @returns {ManagerWithDetails[]} Array of all managers with team and performance data
 */
export async function GET() {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all managers with their team data
    const managers = await prisma.user.findMany({
      where: {
        role: "MANAGER"
      },
      include: {
        teams: {
          include: {
            team: {
              include: {
                members: {
                  select: {
                    id: true,
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                },
                objectives: {
                  select: {
                    id: true,
                    title: true,
                    status: true
                  }
                }
              }
            }
          },
          where: {
            role: "MANAGER" // Only get teams where they are the manager
          }
        },
        updates: {
          select: {
            id: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log("Found managers from DB:", managers.length);
    console.log("Raw managers data:", JSON.stringify(managers, null, 2));

    // Transform data to match frontend interface
    const managersWithDetails: ManagerWithDetails[] = managers.map(manager => {
      // Get the team they manage (should be only one for most managers)
      const managedTeam = manager.teams.find(tm => tm.role === "MANAGER")?.team;

      // Calculate team statistics
      const teamMembers = managedTeam?.members?.length || 0;
      const objectives = managedTeam?.objectives?.length || 0;

      // Determine status based on recent activity
      const lastUpdate = manager.updates[0];
      const lastActive = lastUpdate?.createdAt || new Date();

      // Consider manager inactive if no activity in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const status: "Active" | "Inactive" = lastActive > thirtyDaysAgo ? "Active" : "Inactive";

      return {
        id: manager.id,
        name: manager.name || "Unknown Manager",
        email: manager.email || "",
        role: manager.role,
        status,
        team: managedTeam?.name || "No Team Assigned",
        teamMembers,
        objectives,
        lastActive: lastActive.toISOString(),
        joinedDate: new Date().toISOString() // Using current date since createdAt doesn't exist
      };
    });

    console.log("Transformed managers:", managersWithDetails.length);
    console.log("Final response:", JSON.stringify(managersWithDetails, null, 2));

    return NextResponse.json(managersWithDetails);
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
/*
**
 * POST /api/admin/manage-managers
 * 
 * Creates a new manager and assigns them to a team
 * Requires ADMIN role authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, teamId } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new manager
    const newManager = await prisma.user.create({
      data: {
        name,
        email,
        role: "MANAGER"
      }
    });

    // Assign to team as manager if teamId provided
    if (teamId) {
      await prisma.teamMember.create({
        data: {
          userId: newManager.id,
          teamId: teamId,
          role: "MANAGER"
        }
      });
    }

    return NextResponse.json({
      message: "Manager created successfully",
      managerId: newManager.id
    });
  } catch (error) {
    console.error("Error creating manager:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/manage-managers
 * 
 * Updates an existing manager
 * Requires ADMIN role authentication
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { managerId, name, email, teamId } = body;

    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Update manager details
    const updatedManager = await prisma.user.update({
      where: { id: managerId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      }
    });

    // Update team assignment if specified
    if (teamId) {
      // Remove existing MANAGER roles
      await prisma.teamMember.deleteMany({
        where: {
          userId: managerId,
          role: "MANAGER"
        }
      });
      // Add new MANAGER role
      await prisma.teamMember.create({
        data: {
          userId: managerId,
          teamId,
          role: "MANAGER"
        }
      });
    }

    return NextResponse.json({
      message: "Manager updated successfully",
      managerId: updatedManager.id
    });
  } catch (error) {
    console.error("Error updating manager:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/manage-managers
 * 
 * Removes a manager from the system
 * Requires ADMIN role authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Check if manager has active team responsibilities
    const teamMemberships = await prisma.teamMember.findMany({
      where: {
        userId: managerId,
        role: "MANAGER"
      },
      include: {
        team: {
          include: {
            members: true,
            objectives: true
          }
        }
      }
    });

    // If manager has active teams, we might want to reassign or warn
    if (teamMemberships.length > 0) {
      const hasActiveTeams = teamMemberships.some(tm =>
        tm.team.members.length > 1 || tm.team.objectives.length > 0
      );
      if (hasActiveTeams) {
        return NextResponse.json(
          { error: "Cannot delete manager with active team responsibilities. Please reassign teams first." },
          { status: 400 }
        );
      }
    }

    // Delete manager
    await prisma.user.delete({
      where: { id: managerId }
    });

    return NextResponse.json({
      message: "Manager deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting manager:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}