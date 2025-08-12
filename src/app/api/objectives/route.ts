import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId, title, description } = await req.json();

  if (!teamId || !title || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const objective = await prisma.objective.create({
      data: {
        teamId,
        title,
        description,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        status: "ON_TRACK",
        dueDate: new Date(), // Default to current date, can be updated later
      },
    });

    return NextResponse.json(objective, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create objective" }, { status: 500 });
  }
}
