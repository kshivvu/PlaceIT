import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  status: z.enum(["CORRECT", "WRONG"]),
  reviewNote: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "not logged in" }, { status: 401 });

  if (session.user.role !== "FACULTY" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "only faculty are allowed to review" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", details: parsed.error.flatten },
      { status: 400 },
    );
  }

  const { status, reviewNote } = parsed.data;
  if (status === "WRONG" && !reviewNote) {
    return NextResponse.json(
      { error: "need to add note for wrong review " },
      { status: 400 },
    );
  }

   const { id: submissionId } = await params

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    return NextResponse.json(
      { error: "submission not found" },
      { status: 404 },
    );
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: submission.assignmentId },
  });
  if (!assignment) {
    return NextResponse.json(
      { error: "assignment not found" },
      { status: 404 },
    );
  }
  if (assignment.postedById !== session.user.id) {
    return NextResponse.json(
      { error: "you can review only the assignment you own" },
      { status: 403 },
    );
  }

  if (submission.status !== "PENDING" && submission.status !== "RESUBMITTED") {
    return NextResponse.json(
      {
        error: "SUBMISSION_NOT_REVIEWABLE",
        currentStatus: submission.status,
        message: `Cannot review a submission with status ${submission.status}`,
      },
      { status: 409 },
    );
  }

  const updatedSubmission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status,
      reviewNote: reviewNote ?? null,
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
  });

  if (status === "CORRECT") {
    const reputationGame = submission.status === "PENDING" ? 10 : 5;
    await prisma.user.update({
      where: { id: submission.userId },
      data: {
        reputationScore: {
          increment: reputationGame,
        },
      },
    });
  }

  const notificationMessage =
    status === "CORRECT"
      ? `Your submission for "${assignment.type}" assignment was marked correct. +${submission.status === "PENDING" ? 10 : 5} reputation!`
      : `Your submission for "${assignment.type}" assignment needs revision. Faculty note: ${reviewNote}`;

    await prisma.notification.create({
        data:{
            userId:submission.userId,
            type:"SUBMISSION_REVIEWED",
            message:notificationMessage
        }
    })

    return NextResponse.json(updatedSubmission)
}



