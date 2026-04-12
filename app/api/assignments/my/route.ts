import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "not logged in" }, { status: 401 });
  }

  const studentId = session.user.id;
  const batchId = session.user.batchId;
  if (!batchId) {
    return NextResponse.json({ error: "batch not found" }, { status: 400 });
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      batches: { some: { id: batchId } },
    },

    orderBy: {
      dueDate: "asc",
    },

    include: {
      postedBy: {
        select: { name: true },
      },

      submissions: {
        where: { userId: studentId },
      },
    },
  });

  const transformed=assignments.map(assignment=>({
    ...assignment,
    submission:assignment.submissions[0]??null,
    submissions:undefined

  }))


  return NextResponse.json(transformed)

}



