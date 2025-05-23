/*
  Warnings:

  - Added the required column `userId` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `profit_margins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `quotations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `suppliers` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profit_margins" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;
