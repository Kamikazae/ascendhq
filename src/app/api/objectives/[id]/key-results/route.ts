import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { title, targetValue, currentValue, dueDate } = await req.json();
  const keyResult = await prisma.keyResult.create({
    data: {
      title,
      progress: 0,
      objectiveId: params.id,
      targetValue,
      currentValue,
      dueDate,
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
