import { Injectable } from '@nestjs/common';
import { first } from 'rxjs';
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

    const firstRow = json[0]; // primeira linha

    if (firstRow[0] == 'Dólar da tela') {
      await this.prisma.priceEntry.deleteMany({
        where: { suppliersName: 'Cibra' },
      });

      const dataRows = json.slice(4); // ignora cabeçalho e as 4 primeiras linhas

      const entries = dataRows
        .filter((row: unknown[]) => row.length >= 12)
        .map((row) => ({
          suppliersName: 'Cibra',
          priceCatalogName: row[0]?.toString() || '',
          productName: row[1]?.toString() || '',
          referenceContent: row[2]?.toString() || '',
          usdFobPrice: parseFloat(row[4] as string) || 0,
          deliveryStart: this.excelDateToJSDate(row[7]),
          deliveryEnd: this.excelDateToJSDate(row[8]),
          financialDueDate: this.excelDateToJSDate(row[11]),
        }));

      await this.prisma.priceEntry.createMany({
        data: entries,
        skipDuplicates: true,
      });
      return {
        message: `Planilha importada com sucesso, foram importados: ${entries.length} produtos`,
      };
    } else {
      await this.prisma.priceEntry.deleteMany({
        where: { suppliersName: 'Eurochem' },
      });

      const allEntries: {
        suppliersName: string;
        priceCatalogName: string;
        productName: string;
        referenceContent: string;
        usdFobPrice: number;
        deliveryStart: Date;
        deliveryEnd: Date;
        financialDueDate: Date;
      }[] = [];

      for (const sheetName of workbook.SheetNames.slice(0, 3)) {
        const sheet = workbook.Sheets[sheetName];
        const json: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });

        if (!json || json.length < 14) continue; // ignora abas vazias ou mal formatadas

        const dataRows = json.slice(13); // ignora cabeçalho
        const listeDate = json[11];

        const trimDate = listeDate?.[1]?.toString?.() || '';
        const dateParts = trimDate.split(' ');
        const realdate = dateParts[4] || ''; // ISO-like date

        const entries = dataRows
          .filter((row: unknown[]) => row)
          .map((row) => ({
            suppliersName: 'Eurochem',
            priceCatalogName: row[0]?.toString() || '',
            productName: row[1]?.toString() || '',
            referenceContent: row[1]?.toString() || '',
            usdFobPrice:
              Math.round(parseFloat(String(row[2]).replace(/[^\d.-]/g, ''))) ||
              0,
            deliveryStart: this.excelDateToJSDate(realdate),
            deliveryEnd: this.excelDateToJSDate(realdate),
            financialDueDate: this.excelDateToJSDate(realdate),
          }));

        allEntries.push(...entries);
      }
      //console.log(allEntries);

      if (allEntries.length > 0) {
        await this.prisma.priceEntry.createMany({
          data: allEntries,
          skipDuplicates: true,
        });
      }

      return {
        message: `Planilha importada com sucesso, foram importados: ${allEntries.length} produtos`,
      };
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
}
