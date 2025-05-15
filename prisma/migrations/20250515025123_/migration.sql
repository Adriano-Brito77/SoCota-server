/*
  Warnings:

  - You are about to drop the `price_entries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "price_entries";

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "suppliersName" TEXT NOT NULL,
    "priceCatalogName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "referenceContent" TEXT NOT NULL,
    "usdFobPrice" DOUBLE PRECISION NOT NULL,
    "deliveryStart" TIMESTAMP(3) NOT NULL,
    "deliveryEnd" TIMESTAMP(3) NOT NULL,
    "financialDueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "finance_rate_before_date" DOUBLE PRECISION NOT NULL,
    "finance_rate_after_date" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conpanies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "finance_rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conpanies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profit_margins" (
    "id" TEXT NOT NULL,
    "conpanie_id" TEXT NOT NULL,
    "profit_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profit_margins_pkey" PRIMARY KEY ("id")
);
