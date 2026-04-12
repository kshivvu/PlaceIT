import { z } from "zod"
import nodemailer from "nodemailer"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const bodySchema = z.object({
    email: z.string().email()
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
})

export async function POST(req: NextRequest) {
    const body = await req.json()
    const parse = bodySchema.safeParse(body)

    if (!parse.success) {
        return NextResponse.json({ error: "invalid email" }, { status: 400 })
    }

    const { email } = parse.data

    const code = String(Math.floor((Math.random() * 900000) + 100000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Invalidate old OTPs
    await prisma.otpCode.updateMany({
        where: { email, used: false },
        data: { used: true }
    })

    // Save new OTP
    await prisma.otpCode.create({
        data: { email, code, expiresAt }
    })

    // Send email
    await transporter.sendMail({
        from: `"PlaceIT" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Your PlaceIT verification code",
        html: `
            <h2>Verify your email</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 4px">${code}</h1>
            <p>This code expires in 10 minutes.</p>
            <p>If you didn't request this, ignore this email.</p>
        `
    })

    return NextResponse.json({ success: true })
}





