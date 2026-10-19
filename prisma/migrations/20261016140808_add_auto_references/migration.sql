/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "reference" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_reference_key" ON "Event"("reference");
