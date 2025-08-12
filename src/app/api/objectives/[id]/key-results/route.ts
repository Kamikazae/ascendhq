import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { title } = await req.json();
  const keyResult = await prisma.keyResult.create({
    data: {
      title,
      progress: 0,
      objectiveId: params.id,
      dueDate: new Date(), // Default to current date, can be updated later
    },
  });
  return NextResponse.json(keyResult);
}



export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { progress } = await req.json();
  const updated = await prisma.keyResult.update({
    where: { id: params.id },
    data: { progress },
  });
  return NextResponse.json(updated);
}
