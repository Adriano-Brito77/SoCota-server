import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  name?: string;
  finance_rate_before_date?: number;
  finance_rate_after_date?: number;
}
