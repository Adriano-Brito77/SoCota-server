/*
  Warnings:

  - You are about to drop the `Conpanies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Conpanies";

-- CreateTable
CREATE TABLE "Companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "finance_rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Companies_pkey" PRIMARY KEY ("id")
);
