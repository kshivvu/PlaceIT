import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.collegeId) {
      return NextResponse.json({ error: "Unauthorized or no college associated" }, { status: 401 });
    }

    const batches = await prisma.batch.findMany({
      where: { collegeId: session.user.collegeId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error("GET /api/batches Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
