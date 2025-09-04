-- DropForeignKey
ALTER TABLE "profit_margins" DROP CONSTRAINT "profit_margins_company_id_fkey";

-- DropForeignKey
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_profit_margin_id_fkey";
