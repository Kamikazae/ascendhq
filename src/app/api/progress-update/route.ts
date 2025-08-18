import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

// GET all progress updates
export async function GET() {
  try {
    const updates = await prisma.progressUpdate.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        keyResult: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(updates);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch progress updates" }, { status: 500 });
  }
}

// POST a new progress update
export async function POST(req: Request) {
  try {
    const { keyResultId, userId, newValue, comment } = await req.json();

    const update = await prisma.progressUpdate.create({
      data: {
        keyResultId,
        userId,
        newValue,
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
        keyResult: { select: { id: true, title: true } },
      },
    });

    // also update the KeyResult currentValue + progress automatically
    await prisma.keyResult.update({
      where: { id: keyResultId },
      data: {
        currentValue: newValue,
        progress: Math.round((newValue / (await prisma.keyResult.findUnique({
          where: { id: keyResultId },
          select: { targetValue: true }
        }))!.targetValue) * 100),
      },
    });

    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create progress update" }, { status: 500 });
  }
}
