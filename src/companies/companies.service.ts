import { Companies } from './../../node_modules/.prisma/client/index.d';
import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'src/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

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
        conpanie_id: newCompany.id,
        profit_amount: amount,
        userId: userId,
      })),
    });
    return {
      message: `Empresa ${name} criada com sucesso`,
    };
  }

  async findAll(userId: string) {
    const companies = await this.prisma.companies.findMany({
      where: { userId: userId },
    });
    if (!companies) {
      throw new BadRequestException('Nenhuma empresa encontrada.');
    }
    const profitMargins = await this.prisma.profit_margins.findMany({
      where: {
        userId: userId,
        conpanie_id: {
          in: companies.map((company) => company.id),
        },
      },
      select: {
        profit_amount: true,
        conpanie_id: true,
      },
    });

    const companiesWithProfitMargins = companies.map((company) => {
      const profitMarginsForCompany = profitMargins.filter(
        (margin) => margin.conpanie_id === company.id,
      );
      return {
        ...company,
        profit_amount: profitMarginsForCompany.map(
          (margin) => margin.profit_amount,
        ),
      };
    });

    return companiesWithProfitMargins;
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
      where: { conpanie_id: id, userId },
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

    const company = await this.prisma.companies.delete({
      where: { id },
    });

    const profitMargins = await this.prisma.profit_margins.deleteMany({
      where: { conpanie_id: id, userId },
    });

    return {
      message: `Empresa ${company.name} deletada com sucesso`,
    };
  }
}
