/*
  Warnings:

  - The primary key for the `price_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "price_entries" DROP CONSTRAINT "price_entries_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "price_entries_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "price_entries_id_seq";
