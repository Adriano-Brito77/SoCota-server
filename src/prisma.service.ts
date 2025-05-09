// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect(); // Conecta com o banco ao iniciar a aplicação
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Fecha a conexão ao encerrar a aplicação
  }
}
