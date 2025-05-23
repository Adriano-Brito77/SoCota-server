import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { Query } from '@nestjs/common';
import { PaginationDto } from 'src/excel/pagination/dto/pagination.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/jwt/current-user';
import { AuthUser } from '../auth/jwt/current-user';

@Controller('quotations')
@UseGuards(AuthGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  create(
    @Body() createQuotationDto: CreateQuotationDto[],
    @CurrentUser() user: AuthUser,
  ) {
    return this.quotationsService.create(createQuotationDto, user.id);
  }

  @Get()
  findAll(@Query() query: PaginationDto, @CurrentUser() user: AuthUser) {
    return this.quotationsService.findAll(query, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.quotationsService.remove(id, user.id);
  }
}
