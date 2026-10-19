/*
  Warnings:

  - Added the required column `updatedAt` to the `TimesheetEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TimesheetScope" AS ENUM ('PROJECT', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "TimesheetEntry" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "scope" "TimesheetScope" NOT NULL DEFAULT 'PROJECT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "TimesheetEntry_projectId_date_idx" ON "TimesheetEntry"("projectId", "date");

-- CreateIndex
CREATE INDEX "TimesheetEntry_workItemId_idx" ON "TimesheetEntry"("workItemId");
