/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "user_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_entries" (
    "id" SERIAL NOT NULL,
    "priceCatalogName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "referenceContent" TEXT NOT NULL,
    "packaging" TEXT NOT NULL,
    "usdFobPrice" DOUBLE PRECISION NOT NULL,
    "brlFobPrice" DOUBLE PRECISION NOT NULL,
    "brlCifPrice" DOUBLE PRECISION NOT NULL,
    "deliveryStart" TIMESTAMP(3) NOT NULL,
    "deliveryEnd" TIMESTAMP(3) NOT NULL,
    "billingCenter" TEXT NOT NULL,
    "dispatchLocation" TEXT NOT NULL,
    "financialDueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
