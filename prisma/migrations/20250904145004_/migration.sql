-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_profit_margin_id_fkey" FOREIGN KEY ("profit_margin_id") REFERENCES "profit_margins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
