/*
  Warnings:

  - You are about to alter the column `rating` on the `reviews` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "rating" SET DATA TYPE SMALLINT;
