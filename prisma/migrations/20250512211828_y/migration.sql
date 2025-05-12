/*
  Warnings:

  - Added the required column `suppliersName` to the `price_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "price_entries" ADD COLUMN     "suppliersName" TEXT NOT NULL;
