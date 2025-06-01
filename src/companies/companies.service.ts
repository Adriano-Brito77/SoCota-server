import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'src/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/excel/pagination/dto/pagination.dto';
import { PaginationService } from 'src/excel/pagination/pagination.service';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

  async create(
    { name, finance_rate, profit_amount }: CreateCompanyDto,
    userId: string,
  ) {
    if (!name) {
      throw new BadRequestException('Digite o nome da empresa.');
    }
    const nameExists = await this.prisma.companies.findUnique({
      where: { name, userId },
    });

    if (nameExists) {
      throw new ConflictException('Empresa já existe.');
    }

    if (!finance_rate) {
      finance_rate = 1;
    }
    if (!profit_amount) {
      profit_amount = [1];
    }

    const company = {
      name,
      finance_rate,
      profit_amount,
      userId: userId,
    };

    const newCompany = await this.prisma.companies.create({
      data: {
        name: company.name,
        finance_rate: company.finance_rate,
        userId: company.userId,
      },
      select: {
        id: true, // Retorna apenas o campo "id"
      },
    });

    await this.prisma.profit_margins.createMany({
      data: company.profit_amount.map((amount) => ({
        company_id: newCompany.id,
        profit_amount: amount,
        userId: userId,
      })),
    });
    return {
      message: `Empresa ${name} criada com sucesso`,
    };
  }

  async findAll(
    { page, pageSize, orderBy, search }: PaginationDto,
    userId: string,
  ) {
    let where = {
      userId: userId,
    } as Prisma.CompaniesWhereInput;

    if (search) {
      where = {
        ...where,
        OR: [
          {
            id: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    let orderByObject: Prisma.CompaniesOrderByWithAggregationInput | undefined =
      undefined;

    if (orderBy && orderBy.includes(',')) {
      const [campo, direcao] = orderBy.split(',');
      if (campo && (direcao === 'asc' || direcao === 'desc')) {
        orderByObject = {
          [campo]: direcao,
        } as Prisma.CompaniesOrderByWithAggregationInput;
      }
    }

    const data = await this.paginationService.paginate<
      Prisma.CompaniesWhereInput,
      Prisma.CompaniesOrderByWithAggregationInput
    >(this.prisma.companies, {
      page,
      pageSize,
      where,
      orderBy: orderByObject,
      include: {
        profit_margins: true,
      },
    });

    return data;
  }

  async update(
    id: string,
    { name, finance_rate, profit_amount }: UpdateCompanyDto,
    userId: string,
  ) {
    if (!id) {
      throw new BadRequestException('Essa empresa não existe.');
    }

    const idCompanyExists = await this.prisma.companies.findUnique({
      where: { id, userId },
    });

    if (!idCompanyExists) {
      throw new BadRequestException('Essa empresa não existe.');
    }
    const companyExists = await this.prisma.companies.findUnique({
      where: { name, userId },
    });

    if (companyExists) {
      throw new BadRequestException('Essa empresa ja existe.');
    }

    const companyUpdated = await this.prisma.companies.update({
      where: { id, userId },
      data: {
        name: name,
        finance_rate: finance_rate,
      },
    });

    const CompaniesProfitMargins = await this.prisma.profit_margins.findMany({
      where: { company_id: id, userId },
      select: {
        id: true,
      },
    });

    for (const [index, profitMargin] of CompaniesProfitMargins.entries()) {
      console.log(index, profitMargin);
      if (profit_amount && profit_amount[index] !== undefined) {
        await this.prisma.profit_margins.update({
          where: { id: profitMargin.id },
          data: {
            profit_amount: profit_amount[index],
          },
        });
      }
    }

    return {
      message: `Empresa ${name} atualizada com sucesso`,
    };
  }

  async remove(id: string, userId: string) {
    if (!id) {
      throw new BadRequestException('Essa empresa não existe.');
    }
    const companyExists = await this.prisma.companies.findUnique({
      where: { id, userId },
    });
    if (!companyExists) {
      throw new BadRequestException('Empresa não está registrada.');
    }
    const quotatiosExists = await this.prisma.quotations.findFirst({
      where: { company_id: id, userId },
    });

    if (quotatiosExists) {
      throw new BadRequestException(
        'Ja existe uma ou mias cotação para a empresa.',
      );
    }
    const profitMargins = await this.prisma.profit_margins.deleteMany({
      where: { company_id: id, userId },
    });

    const company = await this.prisma.companies.delete({
      where: { id },
    });

    return {
      message: `Empresa ${company.name} deletada com sucesso`,
    };
  }
}
