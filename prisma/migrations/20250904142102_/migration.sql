-- AddForeignKey
ALTER TABLE "profit_margins" ADD CONSTRAINT "profit_margins_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
