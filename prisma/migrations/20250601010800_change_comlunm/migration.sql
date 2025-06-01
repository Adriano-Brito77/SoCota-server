/*
  Warnings:

  - You are about to drop the column `conpanie_id` on the `profit_margins` table. All the data in the column will be lost.
  - Added the required column `company_id` to the `profit_margins` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profit_margins" DROP COLUMN "conpanie_id",
ADD COLUMN     "company_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "profit_margins" ADD CONSTRAINT "profit_margins_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
