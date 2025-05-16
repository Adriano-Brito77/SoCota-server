/*
  Warnings:

  - Added the required column `dollar_rate` to the `quotations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "dollar_rate" DOUBLE PRECISION NOT NULL;
