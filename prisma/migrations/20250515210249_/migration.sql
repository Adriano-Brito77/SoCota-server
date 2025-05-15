/*
  Warnings:

  - You are about to drop the `Companies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profit_margins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Companies";

-- DropTable
DROP TABLE "Products";

-- DropTable
DROP TABLE "Profit_margins";

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "suppliersName" TEXT NOT NULL,
    "priceCatalogName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "referenceContent" TEXT NOT NULL,
    "usdFobPrice" DOUBLE PRECISION NOT NULL,
    "deliveryStart" TIMESTAMP(3) NOT NULL,
    "deliveryEnd" TIMESTAMP(3) NOT NULL,
    "financialDueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "finance_rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profit_margins" (
    "id" TEXT NOT NULL,
    "conpanie_id" TEXT NOT NULL,
    "profit_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profit_margins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");
