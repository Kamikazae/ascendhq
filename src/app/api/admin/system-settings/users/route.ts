import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface UserRoleInfo {
  id: string;
  name: string;
  email: string;
  currentRole: "ADMIN" | "MANAGER" | "MEMBER";
  teamName?: string;
  joinedDate: string;
  lastActive: string;
  canPromote: boolean;
  canDemote: boolean;
}

/**
 * GET /api/admin/system-settings/users
 * 
 * Retrieves all users with role information for system settings
 * Requires ADMIN role authentication
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        teams: {
          include: {
            team: {
              select: {
                name: true
              }
            }
          },
          take: 1 // Get primary team
        },
        updates: {
          select: {
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

    const usersWithRoleInfo: UserRoleInfo[] = users.map(user => {
      // Get primary team name
      const teamName = user.teams[0]?.team?.name;

      // Get last active date
      const lastUpdate = user.updates[0];
      const lastActive = lastUpdate?.createdAt || new Date();

      // Determine promotion/demotion capabilities
      const canPromote = user.role === "MEMBER" || user.role === "MANAGER";
      const canDemote = user.role === "ADMIN" || user.role === "MANAGER";

      // Don't allow demoting the current admin user
      const isCurrentUser = session ? user.id === session.user.id : false;
      const finalCanDemote = canDemote && !(isCurrentUser && user.role === "ADMIN");

      return {
        id: user.id,
        name: user.name || "Unknown User",
        email: user.email || "",
        currentRole: user.role,
        teamName,
        joinedDate: new Date().toISOString(), // Using current date since createdAt doesn't exist
        lastActive: lastActive.toISOString(),
        canPromote,
        canDemote: finalCanDemote
      };
    });

    return NextResponse.json(usersWithRoleInfo);
  } catch (error) {
    console.error("Error fetching users for system settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}