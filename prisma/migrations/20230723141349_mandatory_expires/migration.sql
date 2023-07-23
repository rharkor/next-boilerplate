/*
  Warnings:

  - Made the column `expires` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expires" SET NOT NULL;
