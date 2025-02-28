import { Injectable } from '@nestjs/common';
import { EmailVerificationToken } from 'apps/api/src/domain/entities/tokens/email-verification-token';
import { IEmailTokenRepository } from 'apps/api/src/domain/repositories/tokens/i-email-token.repository';
import { UUID } from 'crypto';
import { PrismaService } from '../../common/persistence/prisma.service';
import { EmailTokenMapper } from './email-token.mapper';

@Injectable()
export class EmailTokenRepository implements IEmailTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: UUID, tx?: any): Promise<EmailVerificationToken | null> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormToken = await prismaTx.emailToken.findUnique({ where: { id } });
    if (!ormToken) {
      return null;
    }
    return EmailTokenMapper.toDomain(ormToken);
  }

  async getByEmail(email: string, tx?: any): Promise<EmailVerificationToken | null> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormToken = await prismaTx.emailToken.findUnique({ where: { userEmail: email } });
    if (!ormToken) {
      return null;
    }

    return EmailTokenMapper.toDomain(ormToken);
  }

  async save(token: EmailVerificationToken, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.emailToken.create({ data: token });
  }
  async update(token: EmailVerificationToken, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.emailToken.update({ where: { id: token.id }, data: token });
  }
  async deleteById(id: UUID, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.emailToken.delete({ where: { id } });
  }
}
