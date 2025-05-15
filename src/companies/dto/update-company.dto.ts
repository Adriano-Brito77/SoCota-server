import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  name?: string;
  finance_rate?: number;
  profit_amount?: Array<number> | undefined;
}
