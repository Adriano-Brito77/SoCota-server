import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from '../excel/pagination/pagination.service';

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService, PrismaService, PaginationService],
})
export class SuppliersModule {}
