import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/excel/pagination/pagination.service';

@Module({
  controllers: [QuotationsController],
  providers: [QuotationsService, PrismaService, PaginationService],
})
export class QuotationsModule {}
