import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

// GET single update
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const update = await prisma.progressUpdate.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        keyResult: true,
      },
    });

    if (!update) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }

    return NextResponse.json(update);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch update" }, { status: 500 });
  }
}

// DELETE update
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.progressUpdate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Update deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete update" }, { status: 500 });
  }
}
