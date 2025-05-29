import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { Query } from '@nestjs/common';
import { PaginationDto } from './pagination/dto/pagination.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/jwt/current-user';
import { AuthUser } from '../auth/jwt/current-user';

@Controller('excel')
@UseGuards(AuthGuard)
export class ExcelController {
  constructor(private readonly priceService: ExcelService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPriceList(
    @UploadedFile() file: Express.Multer.File,
    @Body('id') id: string,
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.priceService.processPriceList(file, user.id, id);
  }
  @Get('products')
  async getProducts(
    @Query() query: PaginationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.priceService.findAll(query, user.id);
  }
}
