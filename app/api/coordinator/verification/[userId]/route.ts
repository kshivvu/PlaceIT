import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
const verificationActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "COORDINATOR") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const coordinatorCollegeId = session.user.collegeId;
  if (!coordinatorCollegeId) {
    return NextResponse.json(
      { error: "Coordinator has no college assigned" },
      { status: 400 },
    );
  }

  const { userId } = await params;
  const body = await req.json();
  const parsed = verificationActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { action } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }
  if (user.collegeId !== coordinatorCollegeId) {
    return NextResponse.json({ error: "forbidden" }, { status: 400 });
  }
  if (user.verificationStatus !== "PENDING") {
    return NextResponse.json({ error: "forbidden" }, { status: 400 });
  }
  const record = await prisma.studentRecord.findUnique({
    where: {
      email_collegeId: { email: user.email, collegeId: coordinatorCollegeId },
    },
  });
  if (action === "APPROVE") {
    let batchId: string | null = null;
    let batchName:string|null=null;
    if (record) {
      const batch = await prisma.batch.findUnique({
        where: {
          collegeId_name: {
            name: record.batchName,
            collegeId: coordinatorCollegeId,
          },
        },
      });
      batchId = batch?.id ?? null;
      batchName=batch?.id??null
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        roll: record?.roll ?? null,
        verificationStatus: "PENDING",
        batchId,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "VERIFICATION_APPROVED",
        message:
          "your account has been approved by your coordinator! You now have full access to PlaceIt.",
      },
    });

    await transporter.sendMail({
        from: `"PlaceIT" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "Your verification has suceeded",
        html: `
            <h2>You are verfied now</h2>
            <p>%${user.name}:</p>
            <h1 style="letter-spacing: 4px">batch name: ${batchName}</h1>
            <p>You may login with this link</p>
            <a href="https:localhost:3000/login">Login</a>
        `
    })

    return NextResponse.json({
      message: "User approved",
      foundInMasterList: !!record,
    });
  }
  if(action==="REJECT"){
    await prisma.user.update({
        where:{id:userId},
        data:{
            verificationStatus:"UNVERIFIED"
        }
    })
    await prisma.notification.create({
      data: {
        userId,
        type: "VERIFICATION_REJECTED",
        message:
          "your account has been rejected by your coordinator! Please contact your coordinator.",
      },

    });
    await transporter.sendMail({
        from: `"PlaceIT" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "Your verification has suceeded",
        html: `
            <h2>You are verfied now</h2>
            <p>%${user.name}:</p>
            <h1 style="letter-spacing: 4px">batch name: your account has been rejected by your coordinator! Please contact your coordinator.</h1>
            
        `
    })

    return NextResponse.json({
        message:"user rejected",
        foundInMasterList: !!record,
    })
  }
}
