import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  contentSchemas,
  createAssignmentSchema,
} from "@/lib/validation/assignment";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "not logged in" }, { status: 401 });
  }

  if (session.user.role !== "FACULTY" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "only faculty can post assignments" },
      { status: 403 },
    );
  }

  //validate outer shape

  const body = await req.json();
  const parsed = createAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { type, content, dueDate, batchIds } = parsed.data;

  const contentSchema = contentSchemas[type];
  const contentParsed = contentSchema.safeParse(content);
  if (!contentParsed.success) {
    return NextResponse.json(
      {
        error: `invalid content for ${type} assignment`,
        details: contentParsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const facultyCollegeId = session.user.collegeId;
  if (!facultyCollegeId) {
    return NextResponse.json(
      { error: "faculty not assigned to a college" },
      { status: 400 },
    );
  }

  const batches = await prisma.batch.findMany({
    where: { id: { in: batchIds } },
  });

  if (batchIds.length !== batches.length) {
    return NextResponse.json(
      { error: "One or more batches not found" },
      { status: 400 },
    );
  }

  const allBatchesBelongToCollege = batches.every(
    (batch) => batch.collegeId === facultyCollegeId,
  );

  if (!allBatchesBelongToCollege) {
    return NextResponse.json(
      { error: "cant post outside your college" },
      { status: 403 },
    );
  }

  //create the assignment

  const assignment = await prisma.assignment.create({
    data: {
      type,
      content: contentParsed.data,
      dueDate: new Date(dueDate),
      postedById: session.user.id,
      batches: {
        connect: batchIds.map((id) => ({ id })),
      },
    },
    include: {
      batches: true,
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}
