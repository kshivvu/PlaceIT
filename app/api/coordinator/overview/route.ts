import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "COORDINATOR") {
    return NextResponse.json({ error: "forbidded" }, { status: 403 });
  }

  const collegeId = session.user.collegeId;

  if (!collegeId) {
    return NextResponse.json(
      { error: "college not assigned" },
      { status: 400 },
    );
  }

  const batches = await prisma.batch.findMany({
    where: { collegeId },
    include: {
      _count: {
        select: {
          students: true,
          assignments: true,
        },
      },
    },
  });

  const batchStats = await Promise.all(
    batches.map(async (batch) => {
      const totalPossible = batch._count.students * batch._count.assignments;

      const actualSubmission = await prisma.submission.count({
        where: {
          user: { batchId: batch.id },
          assignment: { batches: { some: { id: batch.id } } },
        },
      });

      const activeFlags = await prisma.flag.count({
        where: {
          status: "ACTIVE",
          user: { batchId: batch.id },
        },
      });

      const submissionRate =
        totalPossible === 0
          ? 0
          : Math.round(actualSubmission / totalPossible) * 100;

      return {
        batchId: batch.id,
        batchName: batch.name,
        totalStudents: batch._count.students,
        totalAssignments: batch._count.assignments,
        actualSubmission,
        submissionRate,
        activeFlags,
      };
    }),
  );

  const totalStudents = await prisma.user.count({
    where: { collegeId, role: "STUDENT" },
  });

  const totalPendingVerification = await prisma.user.count({
    where: {
      collegeId,
      role: "STUDENT",
      verificationStatus: "PENDING",
    },
  });

  const totalActiveFlags = await prisma.flag.count({
    where: { status: "ACTIVE", user: { collegeId } },
  });

  return NextResponse.json({
    college: {
      totalStudents,
      totalPendingVerification,
      totalActiveFlags,
    },
    batches: batchStats,
  });
}
