/*
  Warnings:

  - You are about to drop the column `billingCenter` on the `price_entries` table. All the data in the column will be lost.
  - You are about to drop the column `brlCifPrice` on the `price_entries` table. All the data in the column will be lost.
  - You are about to drop the column `brlFobPrice` on the `price_entries` table. All the data in the column will be lost.
  - You are about to drop the column `dispatchLocation` on the `price_entries` table. All the data in the column will be lost.
  - You are about to drop the column `packaging` on the `price_entries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "price_entries" DROP COLUMN "billingCenter",
DROP COLUMN "brlCifPrice",
DROP COLUMN "brlFobPrice",
DROP COLUMN "dispatchLocation",
DROP COLUMN "packaging";
