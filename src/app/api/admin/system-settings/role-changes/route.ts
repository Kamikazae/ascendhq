import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface RoleChange {
  userId: string;
  userName: string;
  fromRole: string;
  toRole: string;
  reason?: string;
}

/**
 * POST /api/admin/system-settings/role-changes
 * 
 * Applies role changes to users
 * Requires ADMIN role authentication
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { changes }: { changes: RoleChange[] } = body;

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    // Validate role changes
    const validRoles = ["ADMIN", "MANAGER", "MEMBER"];
    for (const change of changes) {
      if (!validRoles.includes(change.toRole)) {
        return NextResponse.json(
          { error: `Invalid role: ${change.toRole}` },
          { status: 400 }
        );
      }

      // Prevent demoting the current admin user to non-admin
      if (session && change.userId === session.user.id && 
          change.fromRole === "ADMIN" && 
          change.toRole !== "ADMIN") {
        return NextResponse.json(
          { error: "Cannot demote yourself from admin role" },
          { status: 400 }
        );
      }
    }

    // Apply role changes in a transaction
    await prisma.$transaction(async (tx) => {
      for (const change of changes) {
        await tx.user.update({
          where: { id: change.userId },
          data: { role: change.toRole as "ADMIN" | "MANAGER" | "MEMBER" }
        });

        // If promoting to manager or demoting from manager, update team memberships
        if (change.toRole === "MANAGER" && change.fromRole !== "MANAGER") {
          // When promoting to manager, update their team role to MANAGER if they're in a team
          const teamMembership = await tx.teamMember.findFirst({
            where: { userId: change.userId }
          });
          
          if (teamMembership) {
            await tx.teamMember.update({
              where: { id: teamMembership.id },
              data: { role: "MANAGER" }
            });
          }
        } else if (change.fromRole === "MANAGER" && change.toRole !== "MANAGER") {
          // When demoting from manager, update their team role to MEMBER
          await tx.teamMember.updateMany({
            where: { 
              userId: change.userId,
              role: "MANAGER"
            },
            data: { role: "MEMBER" }
          });
        }
      }
    });

    return NextResponse.json({ 
      message: `Successfully updated ${changes.length} user role${changes.length !== 1 ? 's' : ''}`,
      changesApplied: changes.length
    });
  } catch (error) {
    console.error("Error applying role changes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}