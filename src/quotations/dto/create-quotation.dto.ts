export class CreateQuotationDto {
  company_id: string;
  product_id: string;
  dollar_rate: number;
  delivery_fee: number;
  payment_date: Date;
  profit_margin_id: string;
  supplier_id: string;
  has_credit: boolean;
}
