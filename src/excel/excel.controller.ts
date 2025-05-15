import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { Query } from '@nestjs/common';
import { PaginationDto } from './pagination/dto/pagination.dto';

@Controller('excel')
export class ExcelController {
  constructor(private readonly priceService: ExcelService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPriceList(@UploadedFile() file: Express.Multer.File) {
    console.log('Arquivo recebido:', file);
    return this.priceService.processPriceList(file);
  }
  @Get('products')
  async getProducts(@Query() query: PaginationDto) {
    return this.priceService.findAll(query);
  }
}
