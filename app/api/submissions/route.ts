import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { error } from "console";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  assignmentId: z.string(),
  githubLink: z.string().url().optional(),
  colabLink: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "not logged in " }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json(
      { error: "only student can submit" },
      { status: 403 },
    );
  }
  const studentId = session.user.id;
  const batchId = session.user.batchId;
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", details: parsed.error.flatten },
      { status: 400 },
    );
  }

  const { assignmentId, githubLink, colabLink } = parsed.data;

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      batches: {
        some: { id: batchId! },
      },
    },
  });

  if (!assignment) {
    return NextResponse.json(
      { error: "assignment doesn't exist" },
      { status: 404 },
    );
  }

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  if (assignment.dueDate < twoDaysAgo) {
    return NextResponse.json(
      { error: "assignment is too old to submit" },
      { status: 400 },
    );
  }

  if (assignment.type === "DSA") {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { leetcodeUsername: true },
    });
    if (!student?.leetcodeUsername) {
      return NextResponse.json(
        {
          error: "LEETCODE_USERNAME_NOT_SET",
          message:
            "Set your LeetCode username in your profile before submitting DSA assignments",
        },
        { status: 400 },
      );
    }
  }

  if (assignment.type !== "DSA" && !githubLink) {
    return NextResponse.json(
      { error: "github link is required for the assignment of this type" },
      { status: 400 },
    );
  }

  const existingSubmission = await prisma.submission.findUnique({
    where: {
      userId_assignmentId: { userId: studentId, assignmentId },
    },
  });

  let submission;

  if (!existingSubmission) {
    submission = await prisma.submission.create({
      data: {
        userId: studentId,
        assignmentId,
        githubLink: githubLink ?? null,
        colabLink: colabLink ?? null,
        status: "PENDING",
      },
    });
  } else if (existingSubmission.status === "WRONG") {
    submission = await prisma.submission.update({
      where: { id: existingSubmission.id },
      data: {
        githubLink: githubLink ?? null,
        colabLink: colabLink ?? null,
        status: "RESUBMITTED",
        reviewNote: null, // clear the previous review note
        reviewedById: null, // clear the previous reviewer
        reviewedAt: null, // clear the previous review time
      },
    });
  } else {
    return NextResponse.json(
      {
        error: "SUBMISSION_NOT_ALLOWED",
        currentStatus: existingSubmission.status,
        message: `Cannot submit — current status is ${existingSubmission.status}`,
      },
      { status: 409},
    );
  }

  if(!existingSubmission){
    await updateStreak(studentId);
  }
  return NextResponse.json(submission,{status:201})
}

// ── STREAK CALCULATION ──────────────────────────────────────
// Extracted to its own function — clean and reusable
export async function updateStreak(studentId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      currentStreak: true,
      longestStreak: true,
      submissions: {
        // Find their most recent submission BEFORE today
        where: {
          submittedAt: {
            lt: new Date(new Date().setHours(0, 0, 0, 0)) // before today midnight
          }
        },
        orderBy: { submittedAt: "desc" },
        take: 1  // only need the most recent one
      }
    }
  })

  if (!student) return

  // Check if they already submitted today
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999))

  const submittedToday = await prisma.submission.findFirst({
    where: {
      userId: studentId,
      submittedAt: { gte: todayStart, lte: todayEnd }
    }
  })

  // If they already submitted today, streak is already counted
  if (submittedToday) return

  const lastSubmission = student.submissions[0]
  let newStreak: number

  if (!lastSubmission) {
    // Never submitted before — streak starts at 1
    newStreak = 1
  } else {
    const lastDate = new Date(lastSubmission.submittedAt)
    const yesterday = new Date(todayStart)
    yesterday.setDate(yesterday.getDate() - 1)

    const submittedYesterday =
      lastDate >= yesterday &&
      lastDate < todayStart

    if (submittedYesterday) {
      // Consecutive day — increment
      newStreak = student.currentStreak + 1
    } else {
      // Gap in submissions — reset to 1
      newStreak = 1
    }
  }

  await prisma.user.update({
    where: { id: studentId },
    data: {
      currentStreak: newStreak,
      // longestStreak only updates if newStreak beats the record
      longestStreak: Math.max(newStreak, student.longestStreak),
    }
  })
}
