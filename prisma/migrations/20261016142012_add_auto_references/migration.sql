/*
  Warnings:

  - Made the column `reference` on table `Milestone` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Milestone" ALTER COLUMN "reference" SET NOT NULL;
