import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from 'src/excel/pagination/dto/pagination.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/jwt/current-user';
import { AuthUser } from '../auth/jwt/current-user';

@Controller('suppliers')
@UseGuards(AuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(
    @Body() createSupplierDto: CreateSupplierDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.suppliersService.create(createSupplierDto, user.id);
  }

  @Get()
  findAll(@Query() query: PaginationDto, @CurrentUser() user: AuthUser) {
    return this.suppliersService.findAll(query, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.suppliersService.update(id, updateSupplierDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.suppliersService.remove(id, user.id);
  }
}
