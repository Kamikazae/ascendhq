import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

// TypeScript interfaces matching the frontend expectations
interface MemberWithDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending" | "Inactive";
  team?: string;
  joinedDate: string;
  lastActive?: string;
  contributions: number;
}

/**
 * GET /api/admin/manage-members
 * 
 * Retrieves all system members for admin management
 * Requires ADMIN role authentication
 * 
 * @returns {MemberWithDetails[]} Array of all system members with detailed information
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

    // Fetch all users with their team memberships and contributions
    const users = await prisma.user.findMany({
      include: {
        teams: {
          include: {
            team: {
              select: {
                name: true
              }
            }
          }
        },
        updates: {
          select: {
            id: true,
            newValue: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform data to match frontend interface
    const membersWithDetails: MemberWithDetails[] = users.map(user => {
      // Get primary team (first team membership)
      const primaryTeam = user.teams[0]?.team?.name;

      // Calculate contributions count
      const contributionsCount = user.updates?.length || 0;

      // Determine status based on user activity and data
      let status: "Active" | "Pending" | "Inactive" = "Active";
      if (user.updates.length === 0 && user.teams.length === 0) {
        status = "Pending";
      } else if (user.updates.length === 0) {
        status = "Inactive";
      }

      // Get last activity from updates or team memberships
      const lastUpdate = user.updates[0];
      const lastActive = lastUpdate?.createdAt || new Date();

      return {
        id: user.id,
        name: user.name || "Unknown User",
        email: user.email || "",
        role: user.role,
        status,
        team: primaryTeam,
        joinedDate: new Date().toISOString(), // Using current date since createdAt doesn't exist
        lastActive: lastActive.toISOString(),
        contributions: contributionsCount
      };
    });

    return NextResponse.json(membersWithDetails);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}/*
**
 * POST /api/admin/manage-members
 * 
 * Creates a new system member
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
    const { name, email, role, teamId } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
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

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role.toUpperCase()
      }
    });

    // Add to team if specified
    if (teamId) {
      await prisma.teamMember.create({
        data: {
          userId: newUser.id,
          teamId: teamId,
          role: role === "MANAGER" ? "MANAGER" : "MEMBER"
        }
      });
    }

    return NextResponse.json({ 
      message: "User created successfully",
      userId: newUser.id 
    });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/manage-members
 * 
 * Updates an existing system member
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
    const { userId, name, email, role, teamId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role: role.toUpperCase() })
      }
    });

    // Update team membership if specified
    if (teamId) {
      // Remove existing team memberships
      await prisma.teamMember.deleteMany({
        where: { userId }
      });
      // Add new team membership
      await prisma.teamMember.create({
        data: {
          userId,
          teamId,
          role: role === "MANAGER" ? "MANAGER" : "MEMBER"
        }
      });
    }

    return NextResponse.json({ 
      message: "User updated successfully",
      userId: updatedUser.id 
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/manage-members
 * 
 * Deletes a system member
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ 
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}