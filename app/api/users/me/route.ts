import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { roll, batchId, leetcodeUsername } = body;

    const dataToUpdate: {
      roll?: string;
      batchId?: string;
      leetcodeUsername?: string;
    } = {};
    if (roll !== undefined) dataToUpdate.roll = roll;
    if (batchId !== undefined) dataToUpdate.batchId = batchId;
    if (leetcodeUsername !== undefined)
      dataToUpdate.leetcodeUsername = leetcodeUsername;

    // Validate if roll is unique within the college
    if (roll && session.user.collegeId) {
      const existing = await prisma.user.findFirst({
        where: {
          roll,
          collegeId: session.user.collegeId,
          id: { not: session.user.id },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Roll number already exists in this college" },
          { status: 400 },
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/users/me Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
