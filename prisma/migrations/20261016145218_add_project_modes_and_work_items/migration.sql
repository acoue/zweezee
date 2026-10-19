-- CreateEnum
CREATE TYPE "WorkItemType" AS ENUM ('TASK', 'BUG', 'EVOLUTION', 'INCIDENT');

-- CreateEnum
CREATE TYPE "WorkItemStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "maintenanceEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectEnabled" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "phase" DROP NOT NULL,
ALTER COLUMN "phase" DROP DEFAULT,
ALTER COLUMN "progress" DROP NOT NULL,
ALTER COLUMN "progress" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TimesheetEntry" ADD COLUMN     "workItemId" TEXT;

-- CreateTable
CREATE TABLE "WorkItem" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "WorkItemType" NOT NULL,
    "status" "WorkItemStatus" NOT NULL DEFAULT 'TODO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkItem_reference_key" ON "WorkItem"("reference");

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetEntry" ADD CONSTRAINT "TimesheetEntry_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
