import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  contentSchemas,
  createAssignmentSchema,
} from "@/lib/validation/assignment";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { assign } from "nodemailer/lib/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "not logged in " }, { status: 401 });
  }

  if (session.user.role !== "FACULTY" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "only faculty can view the submission" },
      { status: 403 },
    );
  }

  const { id: assignmentId } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    return NextResponse.json(
      { error: "assignment not found" },
      { status: 404 },
    );
  }

  if (
    assignment.postedById !== session.user.id &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    return NextResponse.json(
      {
        error:
          "allowed to see the submission for the assignment you posted only",
      },
      { status: 403 },
    );
  }

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    orderBy: { submittedAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          roll: true,
          leetcodeUsername: true,
          batchId: true,
        },
      },
    },
  });

  const enriched = submissions.map((submission) => ({
    ...submission,
    isLate: submission.submittedAt > assignment.dueDate,
  }));

  return NextResponse.json(
    {
      assignment: {
        id: assignment.id,
        type: assignment.type,
        content: assignment.content,
        dueDate: assignment.dueDate,

        //summary counts

        totalSubmission: submissions.length,
        pendingReview: submissions.filter(
          (s) => s.status === "PENDING" || s.status === "RESUBMITTED",
        ).length,
        correct: submissions.filter((s) => s.status === "CORRECT").length,
        wrong: submissions.filter((s) => s.status === "WRONG").length,
      },
      submissions: enriched,
    },
    { status: 200 },
  );
}

