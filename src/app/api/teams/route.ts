import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid team name" }, { status: 400 });
  }

  try {
    const team = await prisma.team.create({
      data: {
        name,
        members: {
          create: {
            userId: session.user.id,
            role: "MANAGER", // TeamRole enum
          },
        },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
