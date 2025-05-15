import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from './pagination/pagination.service';

@Module({
  controllers: [ExcelController],
  providers: [ExcelService, PrismaService, PaginationService],
})
export class ExcelModule {}
