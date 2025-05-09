import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  constructor(private prisma: PrismaService) {}

  async processPriceList(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    await this.prisma.priceEntry.deleteMany();

    const dataRows = json.slice(4); // ignora cabeçalho e as 3 primeiras linhas

    const entries = dataRows
      .filter((row: unknown[]) => row.length >= 12)
      .map((row) => ({
        priceCatalogName: row[0]?.toString() || '',
        productName: row[1]?.toString() || '',
        referenceContent: row[2]?.toString() || '',
        packaging: row[3]?.toString() || '',
        usdFobPrice: parseFloat(row[4] as string) || 0,
        brlFobPrice: parseFloat(row[5] as string) || 0,
        brlCifPrice: parseFloat(row[6] as string) || 0,
        deliveryStart: this.excelDateToJSDate(row[7]),
        deliveryEnd: this.excelDateToJSDate(row[8]),
        billingCenter: row[9]?.toString() || '',
        dispatchLocation: row[10]?.toString() || '',
        financialDueDate: this.excelDateToJSDate(row[11]),
      }));

    await this.prisma.priceEntry.createMany({
      data: entries,
      skipDuplicates: true,
    });

    return {
      message: `Planilha importada com sucesso, foram importados: ${entries.length} produtos`,
    };
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
}
