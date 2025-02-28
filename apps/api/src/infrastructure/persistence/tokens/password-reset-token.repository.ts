import { Injectable } from '@nestjs/common';
import { PasswordResetToken } from '../../../domain/entities/tokens/password-reset-token';
import { IPasswordTokenRepository } from '../../../domain/repositories/tokens/i-password-token.repository';
import { UUID } from 'crypto';
import { PrismaService } from '../../common/persistence/prisma.service';
import { PasswordResetTokenMapper } from './password-reset-token.mapper';

@Injectable()
export class PasswordTokenRepository implements IPasswordTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: UUID, tx?: any): Promise<PasswordResetToken | null> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormToken = await prismaTx.passwordResetToken.findFirst({ where: { id } });

    if (!ormToken) {
      return null;
    }

    return PasswordResetTokenMapper.toDomain(ormToken);
  }
  async create(token: PasswordResetToken, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.passwordResetToken.create({ data: token });
  }
  async update(token: PasswordResetToken, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.passwordResetToken.update({ data: token, where: { id: token.id } });
  }
}
