import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from '../excel/pagination/pagination.service';
import { PaginationDto } from '../excel/pagination/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}
  async create(
    {
      name,
      finance_rate_after_date,
      finance_rate_before_date,
    }: CreateSupplierDto,
    userId: string,
  ) {
    if (!name) {
      throw new BadRequestException('Digite o nome do fornecedor.');
    }
    const nameExists = await this.prisma.suppliers.findUnique({
      where: { name },
    });
    if (nameExists) {
      throw new ConflictException('Fornecedor já existe.');
    }
    if (!finance_rate_after_date) {
      finance_rate_after_date = 0;
    }
    if (!finance_rate_before_date) {
      finance_rate_before_date = 0;
    }

    const supplier = {
      name,
      finance_rate_after_date,
      finance_rate_before_date,
    };

    const data = await this.prisma.suppliers.create({
      data: {
        name: supplier.name,
        finance_rate_after_date: supplier.finance_rate_after_date,
        finance_rate_before_date: supplier.finance_rate_before_date,
        userId: userId,
      },
    });

    return {
      message: `Fornecedor ${name} criado com sucesso`,
    };
  }
  async findAllsuppliers(userId: string) {
    const allProductsSuppliers = await this.prisma.suppliers.findMany({
      where: { userId: userId },
    });

    return allProductsSuppliers;
  }

  async findAll(
    { page, pageSize, orderBy, search }: PaginationDto,
    userId: string,
  ) {
    let where = {
      userId: userId,
    } as Prisma.SuppliersWhereInput;

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

    let orderByObject: Prisma.SuppliersOrderByWithAggregationInput | undefined =
      undefined;

    if (orderBy && orderBy.includes(',')) {
      const [campo, direcao] = orderBy.split(',');
      if (campo && (direcao === 'asc' || direcao === 'desc')) {
        orderByObject = {
          [campo]: direcao,
        } as Prisma.SuppliersOrderByWithAggregationInput;
      }
    }

    const data = await this.paginationService.paginate<
      Prisma.SuppliersWhereInput,
      Prisma.SuppliersOrderByWithAggregationInput
    >(this.prisma.suppliers, {
      page,
      pageSize,
      where,
      orderBy: orderByObject,
    });

    return data;
  }

  async update(
    id: string,
    {
      name,
      finance_rate_after_date,
      finance_rate_before_date,
    }: UpdateSupplierDto,
    userId: string,
  ) {
    const supplierExists = await this.prisma.suppliers.findUnique({
      where: { id: id, userId: userId },
    });

    if (!supplierExists) {
      throw new NotFoundException('Fonecedor não encontrado.');
    }

    if (!id) {
      throw new NotFoundException('Fonecedor não encontrado.');
    }

    const data = await this.prisma.suppliers.update({
      where: { id: id, userId: userId },
      data: {
        name: name,
        finance_rate_after_date: finance_rate_after_date,
        finance_rate_before_date: finance_rate_before_date,
      },
    });

    return {
      message: `Fornecedor ${name} atualizado com sucesso`,
    };
  }

  async remove(id: string, userId: string) {
    if (!id) {
      throw new NotFoundException('Fornecedor não encontrado.');
    }

    const supplierExists = await this.prisma.suppliers.findUnique({
      where: { id: id, userId: userId },
    });
    if (!supplierExists) {
      throw new NotFoundException('Fornecedor não encontrado.');
    }

    const quotatiosEcists = await this.prisma.quotations.findFirst({
      where: { supplier_id: id, userId: userId },
    });

    if (quotatiosEcists) {
      throw new NotFoundException(
        'Não é possível deletar esse fornecedor,pois ele já foi utilizado em uma ou mais cotações.',
      );
    }

    const supplier = await this.prisma.suppliers.delete({
      where: { id: id, userId: userId },
    });

    return {
      message: `Fornecedor deletado com sucesso`,
    };
  }
}
