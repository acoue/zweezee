-- CreateEnum
CREATE TYPE "Health" AS ENUM ('GREEN', 'ORANGE', 'RED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('ACTION', 'TASK', 'BUG', 'INCIDENT', 'EVOLUTION', 'JALON');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceEnabled" BOOLEAN NOT NULL DEFAULT false,
    "phase" TEXT,
    "progress" INTEGER,
    "health" "Health" NOT NULL DEFAULT 'GREEN',
    "color" TEXT NOT NULL DEFAULT 'sky',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "ActionType" NOT NULL DEFAULT 'ACTION',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "estimatedHours" DECIMAL(6,2),
    "owner" TEXT,
    "status" "ActionStatus" NOT NULL DEFAULT 'TODO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "source" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "probability" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "owner" TEXT,
    "mitigation" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimesheetEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "activity" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "actionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimesheetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Action_reference_key" ON "Action"("reference");

-- CreateIndex
CREATE INDEX "Action_projectId_idx" ON "Action"("projectId");

-- CreateIndex
CREATE INDEX "Action_dueDate_idx" ON "Action"("dueDate");

-- CreateIndex
CREATE INDEX "Action_type_idx" ON "Action"("type");

-- CreateIndex
CREATE INDEX "Action_status_idx" ON "Action"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Risk_reference_key" ON "Risk"("reference");

-- CreateIndex
CREATE INDEX "Risk_projectId_idx" ON "Risk"("projectId");

-- CreateIndex
CREATE INDEX "TimesheetEntry_projectId_date_idx" ON "TimesheetEntry"("projectId", "date");

-- CreateIndex
CREATE INDEX "TimesheetEntry_actionId_idx" ON "TimesheetEntry"("actionId");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetEntry" ADD CONSTRAINT "TimesheetEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimesheetEntry" ADD CONSTRAINT "TimesheetEntry_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
