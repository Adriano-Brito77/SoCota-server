import { PartialType } from '@nestjs/mapped-types';
import { CreateQuotationDto } from './create-quotation.dto';

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {
  product_id?: string;
  payment_date?: Date;
  profit_margin_id?: string;
  supplier_id?: string;
}
