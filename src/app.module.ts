import { Module } from '@nestjs/common';
import { ExcelModule } from './excel/excel.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CompaniesModule } from './companies/companies.module';
import { QuotationsModule } from './quotations/quotations.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ExcelModule,
    SuppliersModule,
    CompaniesModule,
    QuotationsModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
