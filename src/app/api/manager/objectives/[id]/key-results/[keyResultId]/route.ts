import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireManager } from "@/lib/auth-utils";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; keyResultId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!requireAuth(session)) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        if (!requireManager(session)) {
            return NextResponse.json({ error: "Manager access required" }, { status: 403 });
        }

        const { id: objectiveId, keyResultId } = await params;
        const body = await request.json();
        const { current } = body;

        // Verify manager has access to this objective
        const objective = await prisma.objective.findUnique({
            where: { id: objectiveId },
            include: {
                team: true,
                keyResults: true
            }
        });

        if (!objective) {
            return NextResponse.json({ error: "Objective not found" }, { status: 404 });
        }

        const managerTeam = await prisma.teamMember.findFirst({
            where: {
                userId: session.user.id,
                teamId: objective.teamId,
                role: "MANAGER"
            }
        });

        if (!managerTeam) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Find the key result to get target value
        const keyResult = objective.keyResults.find(kr => kr.id === keyResultId);
        if (!keyResult) {
            return NextResponse.json({ error: "Key result not found" }, { status: 404 });
        }

        // Calculate new progress
        const newProgress = keyResult.targetValue > 0
            ? Math.min((current / keyResult.targetValue) * 100, 100)
            : 0;

        // Update the key result
        const updatedKeyResult = await prisma.keyResult.update({
            where: {
                id: keyResultId,
                objectiveId: objectiveId
            },
            data: {
                currentValue: current,
                progress: Math.round(newProgress)
            }
        });

        // Create a progress update entry
        await prisma.progressUpdate.create({
            data: {
                keyResultId: keyResultId,
                userId: session.user.id,
                newValue: current,
                comment: `Updated by ${session.user.name}`
            }
        }).catch(error => {
            // Progress update is optional, don't fail the request if it fails
            console.warn("Failed to create progress update:", error);
        });

        const response = {
            id: updatedKeyResult.id,
            title: updatedKeyResult.title,
            progress: Math.round(newProgress),
            target: updatedKeyResult.targetValue,
            current: updatedKeyResult.currentValue,
            dueDate: updatedKeyResult.dueDate.toISOString()
        };

        return NextResponse.json(response);
    } catch (error: unknown) {
        console.error("Error updating key result:", error);

        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return NextResponse.json(
                { error: "Key result not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}