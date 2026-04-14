/*
  Warnings:

  - A unique constraint covering the columns `[roll,collegeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "leetcodeVerified" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "User_roll_collegeId_key" ON "User"("roll", "collegeId");
