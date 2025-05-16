/*
  Warnings:

  - Added the required column `delivery_fee` to the `quotations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "delivery_fee" DOUBLE PRECISION NOT NULL;
