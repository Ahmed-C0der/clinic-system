/*
  Warnings:

  - Made the column `slot_duration` on table `doctors` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "doctors" ALTER COLUMN "slot_duration" SET NOT NULL;
