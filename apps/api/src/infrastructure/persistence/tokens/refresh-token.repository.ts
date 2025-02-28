import { Injectable } from '@nestjs/common';
import { RefreshToken } from '../../../domain/entities/tokens/refresh-token';
import { IRefreshTokenRepository } from '../../../domain/repositories/tokens/i-refresh-token.repository';
import { UUID } from 'crypto';
import { PrismaService } from '../../common/persistence/prisma.service';
import { RefreshTokenMapper } from './refresh-token.mapper';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getByToken(token: string, tx?: any): Promise<RefreshToken | null> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormToken = await prismaTx.refreshToken.findFirst({
      where: { token },
    });
    if (!ormToken) {
      return null;
    }

    return RefreshTokenMapper.toDomain(ormToken);
  }
  async getAllActiveTokensByUserId(userId: UUID, tx?: any): Promise<RefreshToken[]> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const tokens = await prismaTx.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
      },
    });

    return tokens.map(RefreshTokenMapper.toDomain);
  }
  async save(token: RefreshToken, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.refreshToken.create({
      data: { ...token },
    });
  }
  async updateToken(token: RefreshToken, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    await prismaTx.refreshToken.update({
      data: token,
      where: { id: token.id },
    });
  }
  async updateMultipleTokens(tokens: RefreshToken[], tx: any): Promise<void> {
    const prismaTx = tx as PrismaService;
    const updates = tokens.map((t) =>
      prismaTx.refreshToken.update({
        data: t,
        where: { id: t.id },
      }),
    );

    await Promise.all(updates);
  }
}
