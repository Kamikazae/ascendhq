/*
  Warnings:

  - Added the required column `dueDate` to the `Objective` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Objective" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL;
