-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "colabLink" TEXT,
ALTER COLUMN "githubLink" DROP NOT NULL;
