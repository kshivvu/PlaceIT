import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "COORDINATOR") {
    return NextResponse.json({ error: "access denied" }, { status: 403 });
  }

  const coordinatorCollegeId = session.user.collegeId;

  if (!coordinatorCollegeId) {
    return NextResponse.json(
      { error: "college id not assigned to coodinator" },
      { status: 400 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "file not uploaded" }, { status: 400 });
  }

  const text = await file.text();

  const lines = text.trim().split("\n");

  const rows = lines.splice(1);

  type CsvRow = {
    name: string;
    email: string;
    roll: string;
    batchName: string;
  };
  const parsed: CsvRow[] = [];

  for (const line of rows) {
    const [name, email, roll, batchName] = line.split(",").map((s) => s.trim());
    if (!name || !email || !roll || !batchName) continue;
    parsed.push({ name, email, roll, batchName });
  }
  if (parsed.length === 0) {
    return NextResponse.json(
      { error: "no correct rows in the imported file" },
      { status: 400 },
    );
  }

  await Promise.all(
    parsed.map((row) =>
      prisma.studentRecord.upsert({
        where: {
          email_collegeId: {
            email: row.email,
            collegeId: coordinatorCollegeId,
          },
        },
        update: { name: row.name, roll: row.roll, batchName: row.batchName },
        create: {
          email: row.email,
          name: row.name,
          roll: row.roll,
          batchName: row.batchName,
          collegeId: coordinatorCollegeId,
        },
      }),
    ),
  );

  const emails = parsed.map((r) => r.email);
  const pendingUsers = await prisma.user.findMany({
    where: {
      email: { in: emails },
      collegeId: coordinatorCollegeId,
      verificationStatus: "PENDING",
    },
  });

  const autoVerified: string[] = [];
  for (const user of pendingUsers) {
    const record = parsed.find((r) => r.email === user.email);
    if (!record) continue;

    const batch = await prisma.batch.findUnique({
      where: {
        collegeId_name: {
          name: record.batchName,
          collegeId: coordinatorCollegeId,
        },
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationStatus: "VERIFIED",
        roll: record.roll,
        batchId: batch?.id ?? null,
      },
    });
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "VERIFICATION_APPROVED",
        message: "Your account has been verified. You now have full access.",
      },
    });
    const college=await prisma.college.findUnique({
      where:{id:batch?.collegeId}
    })
     await transporter.sendMail({
        from: `"PlaceIT" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "Your verification has suceeded",
        html: `
            <h2>You are verfied now</h2>
            <p>%${user.name}:</p>
            <h1 style="letter-spacing: 4px">batch name: ${batch?.name}</h1>
            <p>College: ${college}</p>
            <p>You may login with this link</p>
            <a href="https:localhost:3000/login">Login</a>
        `
    })
    autoVerified.push(user.email);
  }
  return NextResponse.json({
    importedLength: parsed.length,
    autoVerified: autoVerified.length,
    autoVerifiedEmails: autoVerified,
  });
}
