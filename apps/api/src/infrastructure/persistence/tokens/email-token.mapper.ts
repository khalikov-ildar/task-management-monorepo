import { EmailToken as OrmToken } from '@prisma/client';
import { EmailVerificationToken } from '../../../domain/entities/tokens/email-verification-token';
import { UUID } from 'node:crypto';

export class EmailTokenMapper {
  public static toDomain(token: OrmToken): EmailVerificationToken {
    return new EmailVerificationToken(token.userId as UUID, token.token, token.id as UUID);
  }
}
