import { email, success, z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import bcrypt from "bcryptjs";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  code: z.string().min(6),
  collegeId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = bodySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  const { name, email, password, code, collegeId } = parse.data;

  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    return NextResponse.json(
      { error: "invalid or expired OTP" },
      { status: 400 },
    );
  }

  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "user already exists, Please login" },
      { status: 409 },
    );
  }

  const domain = email.split("@")[1];
  const matchedCollege = await prisma.college.findFirst({
    where: {
      domains: { has: domain },
    },
  });

  const verificationStatus = matchedCollege ? "VERIFIED" : "PENDING";
  const resolvedCollegeId = matchedCollege?.id ?? collegeId ?? null;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      verificationStatus,
      collegeId: resolvedCollegeId,
    },
  });

  if (verificationStatus === "PENDING" && resolvedCollegeId) {
    const coordinators = await prisma.user.findMany({
      where: {
        collegeId: resolvedCollegeId,
        role: "COORDINATOR",
      },
    });

    if (coordinators.length > 0) {
      await prisma.notification.createMany({
        data: coordinators.map((coordinator) => ({
          userId: coordinator.id,
          type: "VERIFICATION_REQUEST",
          message: `${name} (${email}) has requested access to your college. Please review.`,
        })),
      });
    }
  }
  return NextResponse.json({ success: true, verificationStatus });
}
