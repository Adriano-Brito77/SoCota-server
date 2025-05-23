import { Injectable } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { PrismaService } from 'src/prisma.service';
import { BadRequestException } from '@nestjs/common';
import {
  isAfter,
  isBefore,
  isEqual,
  startOfMonth,
  differenceInMonths,
} from 'date-fns';
import { Prisma } from '@prisma/client';
import { PaginationService } from '../excel/pagination/pagination.service';
import { PaginationDto } from '../excel/pagination/dto/pagination.dto';

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async create(quotations: CreateQuotationDto[], userId: string) {
    const results: { message: string; quotation: any }[] = [];

    for (const quotation of quotations) {
      const {
        company_id,
        product_id,
        dollar_rate,
        delivery_fee,
        payment_date,
        profit_margin_id,
        supplier_id,
        has_credit,
      } = quotation;
      if (!company_id) {
        throw new BadRequestException('Selecione a empresa.');
      }
      if (!product_id) {
        throw new BadRequestException('Produto não existe.');
      }
      if (!payment_date) {
        throw new BadRequestException('Digite a data de pagamento.');
      }
      if (!profit_margin_id) {
        throw new BadRequestException('Selecine a margem de lucro.');
      }
      if (!supplier_id) {
        throw new BadRequestException('Selecione o fornecedor.');
      }

      const companyExists = await this.prisma.companies.findUnique({
        where: { id: company_id },
      });

      const productExists = await this.prisma.products.findUnique({
        where: { id: product_id },
      });

      const profitMarginExists = await this.prisma.profit_margins.findUnique({
        where: { id: profit_margin_id },
      });

      const supplierExists = await this.prisma.suppliers.findUnique({
        where: { id: supplier_id },
      });

      if (!companyExists) {
        throw new BadRequestException('Empresa não existe.');
      }

      if (!productExists) {
        throw new BadRequestException('Produto não existe.');
      }
      if (!profitMarginExists) {
        throw new BadRequestException('Margem de lucro não existe.');
      }
      if (!supplierExists) {
        throw new BadRequestException('Fornecedor não existe.');
      }

      const priceItem = productExists.usdFobPrice * dollar_rate;

      const productsCost = priceItem + delivery_fee;

      const aplication = await this.getQuotationByDate(
        payment_date!,
        productExists.financialDueDate!,
        has_credit!,
      );
      //Pagamento antecipado ao vencimento da lista do fornecedor
      if (parseFloat(aplication) < 0 && has_credit) {
        const periods = Math.abs(parseFloat(aplication)); // Ex: meses
        let newProductsCost = productsCost;

        for (let i = 0; i < periods; i++) {
          newProductsCost =
            newProductsCost -
            newProductsCost * (supplierExists.finance_rate_before_date / 100);
        }

        const newProductsCostWithProfit =
          newProductsCost / (1 - profitMarginExists.profit_amount / 100);

        const newProductsCostWithProfitFinal = Math.round(
          newProductsCostWithProfit,
        );

        const quotation = {
          product_id: product_id,
          supplier_id: supplier_id,
          company_id: companyExists.id,
          profit_margin_id: profit_margin_id,
          payment_date: payment_date.toString(),
          price: newProductsCostWithProfitFinal,
          delivery_fee: delivery_fee,
          dollar_rate: dollar_rate,
          userId: userId,
        };

        const created = await this.prisma.quotations.create({
          data: quotation,
        });

        results.push({
          message: `Cotação criada com sucesso`,
          quotation: created,
        });
      }

      //Pagamento antecipado ao vencimento da lista do fornecedor (sem credito)
      if (parseFloat(aplication) < 0 && !has_credit) {
        const periods = Math.abs(parseFloat(aplication)); // Ex: meses
        let newProductsCost = priceItem;

        //calculo do valo deduzido no adiantamento
        for (let i = 0; i < periods; i++) {
          newProductsCost =
            newProductsCost -
            newProductsCost * (supplierExists.finance_rate_before_date / 100);
        }

        const newProductsCostwithdelivery_fee = newProductsCost + delivery_fee;

        //calculo da margeme lucro
        const newProductsCostWithProfit =
          newProductsCostwithdelivery_fee /
          (1 - profitMarginExists.profit_amount / 100);

        //valor final arredondado
        const newProductsCostWithProfitFinal = Math.ceil(
          newProductsCostWithProfit,
        );

        const quotation = {
          product_id: product_id,
          supplier_id: supplier_id,
          company_id: companyExists.id,
          profit_margin_id: profit_margin_id,
          payment_date: payment_date.toString(),
          price: newProductsCostWithProfitFinal,
          delivery_fee: delivery_fee,
          dollar_rate: dollar_rate,
          userId: userId,
        };

        const created = await this.prisma.quotations.create({
          data: quotation,
        });

        results.push({
          message: `Cotação criada com sucesso`,
          quotation: created,
        });
      }
      //Pagamento após vencimento da lista do fornecedor (sem credito)
      if (parseFloat(aplication) > 0 && !has_credit) {
        const periods = Math.abs(parseFloat(aplication)); // Ex: meses

        //calculo do valor acrescido para pagamento após o vencimento da lista do fornecedor
        const newProductsCost =
          productsCost / (1 - (companyExists.finance_rate * periods) / 100);

        //calculo da margeme lucro
        const newProductsCostWithProfit =
          newProductsCost / (1 - profitMarginExists.profit_amount / 100);

        const newProductsCostWithProfitFinal = Math.ceil(
          newProductsCostWithProfit,
        );

        const quotation = {
          product_id: product_id,
          supplier_id: supplier_id,
          company_id: companyExists.id,
          profit_margin_id: profit_margin_id,
          payment_date: payment_date.toString(),
          price: newProductsCostWithProfitFinal,
          delivery_fee: delivery_fee,
          dollar_rate: dollar_rate,
          userId: userId,
        };

        const created = await this.prisma.quotations.create({
          data: quotation,
        });

        results.push({
          message: `Cotação criada com sucesso`,
          quotation: created,
        });
      }

      //Pagamento a prazo com credito(obs: Sera utilizado a data da planilha)
      if (parseFloat(aplication) > 0 && has_credit) {
        const periods = Math.abs(parseFloat(aplication)); // Ex: meses
        let newProductsCost = productsCost;

        for (let i = 0; i < periods; i++) {
          newProductsCost =
            newProductsCost +
            newProductsCost * (companyExists.finance_rate / 100);
        }

        const newProductsCostWithProfit =
          newProductsCost / (1 - profitMarginExists.profit_amount / 100);

        const newProductsCostWithProfitFinal = Math.round(
          newProductsCostWithProfit,
        );

        const quotation = {
          product_id: product_id,
          supplier_id: supplier_id,
          company_id: companyExists.id,
          profit_margin_id: profit_margin_id,
          payment_date: payment_date.toString(),
          price: newProductsCostWithProfitFinal,
          delivery_fee: delivery_fee,
          dollar_rate: dollar_rate,
          userId: userId,
        };

        const created = await this.prisma.quotations.create({
          data: quotation,
        });

        results.push({
          message: `Cotação criada com sucesso`,
          quotation: created,
        });
      }
    }
    if (results.length === 0) {
      throw new BadRequestException('Nenhuma cotação foi criada.');
    }

    return {
      message: `Foram criadas ${results.length} cotações com sucesso.`,
      quotations: results.map((r) => r.quotation),
    };
  }
  private async getQuotationByDate(
    dataStr1: Date,
    dataStr2: Date,
    has_credit: boolean,
  ): Promise<string> {
    if (!dataStr1 || !dataStr2) {
      throw new BadRequestException('Datas inválidas para comparação');
    }
    //data1= pagamento do cliente
    //data2= vecimento da lista do fornecedor
    const date1 = startOfMonth(dataStr1);
    const date2 = startOfMonth(dataStr2);

    if (isEqual(date1, date2)) {
      const datereal = 1;
      return `${datereal}`;
    }

    if (isBefore(date1, date2) && !has_credit) {
      const datereal = differenceInMonths(date1, date2);
      return `${datereal}`;
    }
    if (isAfter(date1, date2) && !has_credit) {
      const datereal = differenceInMonths(date1, date2);
      return `${datereal}`;
    }
    if (isBefore(date1, date2)) {
      const datereal = differenceInMonths(date1, date2);
      return `${datereal}`;
    }

    if (isAfter(date1, date2)) {
      const datereal = differenceInMonths(date1, date2);
      return `${datereal}`;
    }

    return 'As datas não podem ser comparadas';
  }

  async findAll(
    { page, pageSize, orderBy, search }: PaginationDto,
    userId: string,
  ) {
    let where = { userId: userId } as Prisma.QuotationsWhereInput;

    if (search) {
      where = {
        ...where,
        OR: [
          {
            company_id: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    let orderByObject:
      | Prisma.QuotationsOrderByWithAggregationInput
      | undefined = undefined;

    if (orderBy && orderBy.includes(',')) {
      const [campo, direcao] = orderBy.split(',');
      if (campo && (direcao === 'asc' || direcao === 'desc')) {
        orderByObject = {
          [campo]: direcao,
        } as Prisma.QuotationsOrderByWithAggregationInput;
      }
    }

    const data = await this.paginationService.paginate<
      Prisma.QuotationsWhereInput,
      Prisma.QuotationsOrderByWithAggregationInput
    >(this.prisma.quotations, {
      page,
      pageSize,
      where,
      orderBy: orderByObject,
      include: {
        products: true,
        suppliers: true,
        companies: true,
        profit_margins: true,
      },
    });

    return data;
  }

  async remove(id: string, userId: string) {
    const quotation = await this.prisma.quotations.findUnique({
      where: { id: id, userId: userId },
    });

    if (!quotation) {
      throw new BadRequestException('Cotação não encontrada.');
    }

    await this.prisma.quotations.delete({
      where: { id: id, userId: userId },
    });

    return {
      message: 'Cotação excluída com sucesso.',
    };
  }
}
