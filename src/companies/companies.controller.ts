import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/jwt/current-user';
import { AuthUser } from '../auth/jwt/current-user';
import { PaginationDto } from 'src/excel/pagination/dto/pagination.dto';

@Controller('companies')
@UseGuards(AuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.companiesService.create(createCompanyDto, user.id);
  }

  @Get('allcompanies')
  findAllProducts(@CurrentUser() user: AuthUser) {
    return this.companiesService.findAllcompanies(user.id);
  }
  @Get()
  findAll(@Query() query: PaginationDto, @CurrentUser() user: AuthUser) {
    return this.companiesService.findAll(query, user.id);
  }
  @Get('allprofit/:id')
  findAllProfit(@CurrentUser() user: AuthUser, @Param('id') id?: string) {
    return this.companiesService.findAllProfit(user.id, id ?? '');
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.companiesService.update(id, updateCompanyDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.companiesService.remove(id, user.id);
  }
}
