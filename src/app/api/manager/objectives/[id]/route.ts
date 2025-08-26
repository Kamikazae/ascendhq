import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireManager } from "@/lib/auth-utils";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!requireAuth(session)) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        if (!requireManager(session)) {
            return NextResponse.json({ error: "Manager access required" }, { status: 403 });
        }

        const { id: objectiveId } = await params;

        const objective = await prisma.objective.findUnique({
            where: { id: objectiveId },
            include: {
                keyResults: true,
                team: {
                    select: {
                        name: true,
                        members: {
                            include: {
                                user: {
                                    select: { name: true, email: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!objective) {
            return NextResponse.json(
                { error: "Objective not found" },
                { status: 404 }
            );
        }

        // Verify manager has access to this objective
        const managerTeam = await prisma.teamMember.findFirst({
            where: {
                userId: session.user.id,
                teamId: objective.teamId,
                role: "MANAGER"
            }
        });

        if (!managerTeam) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Calculate progress based on key results
        const keyResultsWithProgress = objective.keyResults.map(kr => ({
            id: kr.id,
            title: kr.title,
            progress: kr.progress,
            target: kr.targetValue,
            current: kr.currentValue,
            dueDate: kr.dueDate.toISOString()
        }));

        // Calculate overall progress
        const totalProgress = keyResultsWithProgress.reduce((sum, kr) => sum + kr.progress, 0);
        const avgProgress = keyResultsWithProgress.length > 0 ? totalProgress / keyResultsWithProgress.length : 0;

        const response = {
            id: objective.id,
            title: objective.title,
            description: objective.description,
            status: objective.status,
            progress: Math.round(avgProgress),
            dueDate: objective.dueDate.toISOString(),
            startDate: objective.startDate.toISOString(),
            endDate: objective.endDate.toISOString(),
            teamName: objective.team.name,
            assignedMembers: objective.team.members.map(member => member.user.name),
            keyResults: keyResultsWithProgress
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching objective:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!requireAuth(session)) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        if (!requireManager(session)) {
            return NextResponse.json({ error: "Manager access required" }, { status: 403 });
        }

        const { id: objectiveId } = await params;
        const body = await request.json();

        // Verify manager has access to this objective
        const objective = await prisma.objective.findUnique({
            where: { id: objectiveId },
            include: { team: true }
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

        const updatedObjective = await prisma.objective.update({
            where: { id: objectiveId },
            data: body,
            include: {
                keyResults: true,
                team: {
                    select: {
                        name: true,
                        members: {
                            include: {
                                user: {
                                    select: { name: true, email: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Calculate progress based on key results
        const keyResultsWithProgress = updatedObjective.keyResults.map(kr => ({
            id: kr.id,
            title: kr.title,
            progress: kr.progress,
            target: kr.targetValue,
            current: kr.currentValue,
            dueDate: kr.dueDate.toISOString()
        }));

        // Calculate overall progress
        const totalProgress = keyResultsWithProgress.reduce((sum, kr) => sum + kr.progress, 0);
        const avgProgress = keyResultsWithProgress.length > 0 ? totalProgress / keyResultsWithProgress.length : 0;

        const response = {
            id: updatedObjective.id,
            title: updatedObjective.title,
            description: updatedObjective.description,
            status: updatedObjective.status,
            progress: Math.round(avgProgress),
            dueDate: updatedObjective.dueDate.toISOString(),
            startDate: updatedObjective.startDate.toISOString(),
            endDate: updatedObjective.endDate.toISOString(),
            teamName: updatedObjective.team.name,
            assignedMembers: updatedObjective.team.members.map(member => member.user.name),
            keyResults: keyResultsWithProgress
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error updating objective:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}