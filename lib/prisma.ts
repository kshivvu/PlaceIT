import { PrismaClient } from "@/app/generated/prisma"

// This pattern prevents creating too many DB connections
// in development due to hot reloading
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") 
  globalForPrisma.prisma = prisma