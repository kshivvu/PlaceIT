-- CreateTable
CREATE TABLE "StudentRecord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "batchName" TEXT NOT NULL,
    "roll" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentRecord_email_key" ON "StudentRecord"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentRecord_email_collegeId_key" ON "StudentRecord"("email", "collegeId");

-- AddForeignKey
ALTER TABLE "StudentRecord" ADD CONSTRAINT "StudentRecord_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
