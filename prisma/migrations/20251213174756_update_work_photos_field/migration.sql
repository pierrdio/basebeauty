/*
  Warnings:

  - You are about to drop the column `photo` on the `works` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "works" DROP COLUMN "photo",
ADD COLUMN     "photos" TEXT NOT NULL DEFAULT '[]';
