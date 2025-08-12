/*
  Warnings:

  - Added the required column `dueDate` to the `KeyResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."KeyResult" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;
