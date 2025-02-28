import { PasswordResetToken as OrmToken } from '@prisma/client';
import { PasswordResetToken } from 'apps/api/src/domain/entities/tokens/password-reset-token';
import { UUID } from 'node:crypto';

export class PasswordResetTokenMapper {
  public static toDomain(token: OrmToken): PasswordResetToken {
    return new PasswordResetToken(token.token, token.userId as UUID, token.isUsed, token.usedAt, token.id as UUID);
  }
}
