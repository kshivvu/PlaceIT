import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { postedById: session.user.id },
      orderBy: { dueDate: "asc" },
      include: {
        batches: true,
        submissions: {
          select: {
            status: true,
          },
        },
      },
    });

    const result = assignments.map((a) => {
      const counts = {
        pendingReview: 0,
        correct: 0,
        wrong: 0,
        resubmitted: 0,
      };

      a.submissions.forEach((sub) => {
        if (sub.status === "PENDING") counts.pendingReview++;
        else if (sub.status === "CORRECT") counts.correct++;
        else if (sub.status === "WRONG") counts.wrong++;
        else if (sub.status === "RESUBMITTED") counts.resubmitted++;
      });

      // To calculate total missing students, we probably need total count of users in these batches.
      // We can count the total students in these batches in a separate query if needed.
      return {
        id: a.id,
        type: a.type,
        content: a.content,
        dueDate: a.dueDate,
        batches: a.batches.map((b) => b.name),
        batchIds: a.batches.map((b) => b.id),
        submissionCounts: counts,
        totalSubmissions: a.submissions.length,
      };
    });

    // Let's attach full batch student counts
    const batchesWithCount = await prisma.batch.findMany({
      where: {
        id: { in: result.flatMap((a) => a.batchIds) },
      },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    const batchCountMap = new Map(
      batchesWithCount.map((b) => [b.id, b._count.students]),
    );

    const finalResult = result.map((a) => {
      const totalStudents = a.batchIds.reduce(
        (sum, id) => sum + (batchCountMap.get(id) || 0),
        0,
      );
      return {
        ...a,
        totalStudents,
      };
    });

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("GET /api/assignments/mine Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
