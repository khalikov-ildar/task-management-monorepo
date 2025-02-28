import { Injectable } from '@nestjs/common';
import { ITransactionManager } from '../../../application/common/services/i-transaction.manager';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTransactionManager implements ITransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
