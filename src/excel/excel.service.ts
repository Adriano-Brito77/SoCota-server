import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as XLSX from 'xlsx';
import { format, parse, endOfMonth } from 'date-fns';
import { id, ptBR } from 'date-fns/locale';
import { PaginationDto } from './pagination/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import { PaginationService } from './pagination/pagination.service';

@Injectable()
export class ExcelService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async processPriceList(
    file: Express.Multer.File,
    userId: string,
    id: string,
  ) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const firstRow = json[0]; // primeira linha
    console.log(firstRow);

    const supplierExist = await this.prisma.suppliers.findUnique({
      where: { id: id },
    });

    if (!supplierExist) {
      throw new NotFoundException('Fornecedor não existe.');
    }

    if (firstRow[0] == 'Dólar da tela') {
      //deleta os dados antigos
      await this.prisma.products.deleteMany({
        where: { suppliersName: id },
      });

      const dataRows = json.slice(4); // ignora cabeçalho e as 4 primeiras linhas

      const entries = dataRows
        .filter((row: unknown[]) => row.length >= 12)
        .map((row) => ({
          suppliersName: supplierExist?.name ?? '',
          suppliersId: id,
          priceCatalogName: row[0]?.toString() || '',
          productName: row[1]?.toString() || '',
          referenceContent: row[2]?.toString() || '',
          usdFobPrice: parseFloat(row[4] as string) || 0,
          deliveryStart: this.excelDateToJSDate(row[7]),
          deliveryEnd: this.excelDateToJSDate(row[8]),
          financialDueDate: this.excelDateToJSDate(row[11]),
          userId: userId,
        }));

      await this.prisma.products.createMany({
        data: entries,
      });
      return {
        message: `Planilha importada com sucesso, foram importados: ${entries.length} produtos`,
      };
    }

    if (
      typeof firstRow[0] === 'string' &&
      firstRow[0].includes('LISTA DE PREÇO')
    ) {
      await this.prisma.products.deleteMany({
        where: { suppliersName: id },
      });

      const allEntries: {
        suppliersName: string;
        suppliersId: string;
        priceCatalogName: string;
        productName: string;
        referenceContent: string;
        usdFobPrice: number;
        deliveryStart: Date;
        deliveryEnd: Date;
        financialDueDate: Date;
        userId: string;
      }[] = [];

      for (const sheetName of workbook.SheetNames.slice(0, 5)) {
        //Consultando os nomes das 5 primeiras abas
        const sheet = workbook.Sheets[sheetName];
        const json: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });

        const nameTable = ['Tabela de Frete'];

        if (nameTable.includes(sheetName)) {
          continue; // ignora tabelas de frete
        }

        if (!json || json.length < 3) continue; // ignora abas vazias ou mal formatadas

        const dataRows = json.slice(13); // ignora cabeçalho

        const listeDate = json[11];

        const trimDate = listeDate?.[1]?.toString?.() || '';
        const dateParts = trimDate.split(' ');
        const realdate = dateParts[4] || ''; // ISO-like date

        const monthstart = sheetName.split(' ')[1];
        const monthend = sheetName.split(' ')[3];

        // Função que converte "janeiro" -> "01/01/2025"
        function getFirstDayOfMonth(
          monthName: string,
          year = new Date().getFullYear(),
        ): string {
          // Converte nome do mês para data usando o formato "MMMM" (ex: 'janeiro')
          const parsedDate = parse(monthName, 'MMMM', new Date(), {
            locale: ptBR,
          });
          // Define o ano atual
          parsedDate.setFullYear(year);
          // Retorna no formato "dd/MM/yyyy"
          return format(parsedDate, 'dd/MM/yyyy');
        }

        function getLastDayOfMonth(
          monthName: string,
          year = new Date().getFullYear(),
        ): string {
          const parsedDate = parse(monthName, 'MMMM', new Date(), {
            locale: ptBR,
          });
          parsedDate.setFullYear(year);
          const lastDay = endOfMonth(parsedDate);
          return format(lastDay, 'dd/MM/yyyy');
        }

        const deliveryStart = getFirstDayOfMonth(monthstart);
        const deliveryEnd = getLastDayOfMonth(monthend);

        const entries = dataRows
          .filter((row: unknown[]) => row.length >= 2)
          .map((row) => ({
            suppliersName: supplierExist.name,
            suppliersId: id,
            priceCatalogName: row[0]?.toString() || 'teste',
            productName: row[1]?.toString() || '',
            referenceContent: row[1]?.toString() || '',
            usdFobPrice:
              Math.round(parseFloat(String(row[2]).replace(/[^\d.-]/g, ''))) ||
              0,
            deliveryStart: this.excelDateToJSDate(deliveryStart),
            deliveryEnd: this.excelDateToJSDate(deliveryEnd),
            financialDueDate: this.excelDateToJSDate(realdate),
            userId: userId,
          }));

        allEntries.push(...entries);
      }

      if (allEntries.length > 0) {
        await this.prisma.products.createMany({
          data: allEntries,
        });
      }

      return {
        message: `Planilha importada com sucesso, foram importados: ${allEntries.length} produtos`,
      };
    } else {
      throw new NotFoundException(
        'Essa planilha não condiz com o formato   pedido',
      );
    }
  }

  private excelDateToJSDate(excelDate: any): Date {
    if (typeof excelDate === 'number') {
      const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
      return new Date(jsDate.toISOString().split('T')[0]); // ok
    }

    if (typeof excelDate === 'string') {
      // Trata strings no formato dd/MM/yyyy
      const dateParts = excelDate.split('/');
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts.map(Number);
        return new Date(year, month - 1, day);
      }

      // Caso venha num formato ISO válido
      const parsed = new Date(excelDate);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    return new Date(); // fallback
  }

  async findAll(
    { page, pageSize, orderBy, search }: PaginationDto,
    userId: string,
  ) {
    let where = {
      userId: userId,
    } as Prisma.ProductsWhereInput;

    if (search) {
      where = {
        ...where,
        OR: [
          {
            suppliersId: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    let orderByObject: Prisma.ProductsOrderByWithAggregationInput | undefined =
      undefined;

    if (orderBy && orderBy.includes(',')) {
      const [campo, direcao] = orderBy.split(',');
      if (campo && (direcao === 'asc' || direcao === 'desc')) {
        orderByObject = {
          [campo]: direcao,
        } as Prisma.ProductsOrderByWithAggregationInput;
      }
    }

    const data = await this.paginationService.paginate<
      Prisma.ProductsWhereInput,
      Prisma.ProductsOrderByWithAggregationInput
    >(this.prisma.products, {
      page,
      pageSize,
      where,
      orderBy: orderByObject,
    });

    return data;
  }
  async findAllProducts(userId: string, id: string) {
    const allProductsSuppliers = await this.prisma.products.findMany({
      where: { userId: userId, suppliersId: id },
    });

    const products = {
      data: allProductsSuppliers,
    };
    return allProductsSuppliers;
  }
}
