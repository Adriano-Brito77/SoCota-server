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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/jwt/current-user';
import { AuthUser } from '../auth/jwt/current-user';

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

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.companiesService.findAll(user.id);
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
