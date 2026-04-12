import { PrismaClient } from "@/app/generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ============================================================
  // COLLEGE
  // Use upsert — safe to run seed multiple times without duplicates
  // ============================================================
  const college = await prisma.college.upsert({
    where: { name: "SFIT Mumbai" },
    update: {},
    create: {
      name: "SFIT Mumbai",
      // Any signup with @sfit.ac.in will be auto-VERIFIED
      domains: ["sfit.ac.in"],
    },
  })
  console.log("✅ College created:", college.name)

  // ============================================================
  // BATCHES
  // ============================================================
  // Replace all three batch upserts with this pattern

async function upsertBatch(name: string, collegeId: string) {
  const existing = await prisma.batch.findFirst({
    where: { name, collegeId }
  })
  if (existing) return existing
  return prisma.batch.create({
    data: { name, collegeId }
  })
}

const batchA = await upsertBatch("Batch A", college.id)
const batchB = await upsertBatch("Batch B", college.id)
const batchC = await upsertBatch("Batch C", college.id)
console.log("batch A  , batch B , batch C created")
  // ============================================================
  // PASSWORD HASH — same password for all seed users
  // Password: Test@1234
  // ============================================================
  const passwordHash = await bcrypt.hash("Test@1234", 12)

  // ============================================================
  // SUPER ADMIN — you (Shivam)
  // ============================================================
  const admin = await prisma.user.upsert({
    where: { email: "admin@sfit.ac.in" },
    update: {},
    create: {
      name: "Shivam Kumar",
      email: "admin@sfit.ac.in",
      passwordHash,
      role: "SUPER_ADMIN",
      verificationStatus: "VERIFIED",
      collegeId: college.id,
    },
  })

  // ============================================================
  // COORDINATOR
  // ============================================================
  const coordinator = await prisma.user.upsert({
    where: { email: "coordinator@sfit.ac.in" },
    update: {},
    create: {
      name: "Dr. Priya Sharma",
      email: "coordinator@sfit.ac.in",
      passwordHash,
      role: "COORDINATOR",
      verificationStatus: "VERIFIED",
      collegeId: college.id,
    },
  })

  // ============================================================
  // FACULTY
  // ============================================================
  const faculty = await prisma.user.upsert({
    where: { email: "faculty@sfit.ac.in" },
    update: {},
    create: {
      name: "Prof. Rahul Mehta",
      email: "faculty@sfit.ac.in",
      passwordHash,
      role: "FACULTY",
      verificationStatus: "VERIFIED",
      collegeId: college.id,
    },
  })

  // ============================================================
  // STUDENT 1 — Batch A (main test student)
  // ============================================================
  const student1 = await prisma.user.upsert({
    where: { email: "student1@sfit.ac.in" },
    update: {},
    create: {
      name: "Arjun Patel",
      email: "student1@sfit.ac.in",
      passwordHash,
      role: "STUDENT",
      verificationStatus: "VERIFIED",
      collegeId: college.id,
      batchId: batchA.id,
      reputationScore: 35,
      currentStreak: 4,
      longestStreak: 7,
    },
  })

  // ============================================================
  // STUDENT 2 — Batch B
  // ============================================================
  const student2 = await prisma.user.upsert({
    where: { email: "student2@sfit.ac.in" },
    update: {},
    create: {
      name: "Sneha Reddy",
      email: "student2@sfit.ac.in",
      passwordHash,
      role: "STUDENT",
      verificationStatus: "VERIFIED",
      collegeId: college.id,
      batchId: batchB.id,
      reputationScore: 10,
      currentStreak: 1,
      longestStreak: 3,
    },
  })

  console.log("✅ Users created: admin, coordinator, faculty, 2 students")

  // ============================================================
  // ASSIGNMENT — posted by faculty, for Batch A and Batch B
  // Content matches the DSA Zod schema: { problems, note? }
  // ============================================================
  const assignment = await prisma.assignment.upsert({
    where: { id: "seed-assignment-001" },
    update: {},
    create: {
      id: "seed-assignment-001",
      type: "DSA",
      content: {
        problems: [
          { url: "https://leetcode.com/problems/two-sum/", difficulty: "EASY" },
          { url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "EASY" },
          { url: "https://leetcode.com/problems/maximum-subarray/", difficulty: "MEDIUM" },
        ],
        note: "Focus on the sliding window pattern for the last problem.",
      },
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // due tomorrow
      postedById: faculty.id,
      batches: {
        connect: [{ id: batchA.id }, { id: batchB.id }],
      },
    },
  })
  console.log("✅ Assignment created: DSA — Arrays (due tomorrow)")

  // ============================================================
  // PENDING USER — to test coordinator verification flow
  // ============================================================
  await prisma.user.upsert({
    where: { email: "pending@gmail.com" },
    update: {},
    create: {
      name: "Rohan Verma",
      email: "pending@gmail.com",
      passwordHash,
      role: "STUDENT",
      verificationStatus: "PENDING",
      collegeId: college.id, // manually assigned
    },
  })

  // Notification to coordinator about the pending user
  await prisma.notification.create({
    data: {
      userId: coordinator.id,
      type: "VERIFICATION_REQUEST",
      message: "Rohan Verma (pending@gmail.com) has requested access. Please review.",
    },
  })

  console.log("✅ Pending user created: pending@gmail.com")
  console.log("")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("🎉 Seed complete. Login credentials:")
  console.log("")
  console.log("  Role         Email                       Password")
  console.log("  ─────────    ─────────────────────────   ──────────")
  console.log("  Super Admin  admin@sfit.ac.in            Test@1234")
  console.log("  Coordinator  coordinator@sfit.ac.in      Test@1234")
  console.log("  Faculty      faculty@sfit.ac.in          Test@1234")
  console.log("  Student 1    student1@sfit.ac.in         Test@1234")
  console.log("  Student 2    student2@sfit.ac.in         Test@1234")
  console.log("  Pending      pending@gmail.com           Test@1234")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })