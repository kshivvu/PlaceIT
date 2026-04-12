import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {  z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = bodySchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const { email, code, password } = parse.data;

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
  })

  const user=await prisma.user.findUnique({
    where:{
        email
    }
  })


  if(!user){
    return NextResponse.json({error:"invalid user"},{status:400})

  }

  const hashPassword=await bcrypt.hash(password,12)

  await prisma.user.update({
    where:{email},
    data:{
        passwordHash:hashPassword
    }
  })


  return NextResponse.json({success:"successfully password reset done"})
}
