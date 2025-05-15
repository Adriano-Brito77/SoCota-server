import { Module } from '@nestjs/common';
import { ExcelModule } from './excel/excel.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [ExcelModule, SuppliersModule, CompaniesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
