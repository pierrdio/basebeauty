/*
  Warnings:

  - You are about to drop the column `email` on the `contact_submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contact_submissions" 
ADD COLUMN "phone" TEXT NOT NULL DEFAULT '+7',
DROP COLUMN "email";
