import { RefreshToken as OrmToken } from '@prisma/client';
import { RefreshToken } from '../../../domain/entities/tokens/refresh-token';
import { UUID } from 'node:crypto';

export class RefreshTokenMapper {
  public static toDomain(token: OrmToken): RefreshToken {
    return new RefreshToken(token.userId as UUID, token.token, token.id as UUID, token.isRevoked, token.revokedAt, token.createdAt);
  }
}
