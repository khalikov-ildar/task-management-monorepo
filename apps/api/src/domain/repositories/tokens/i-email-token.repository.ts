import { UUID } from 'node:crypto';
import { EmailVerificationToken } from '../../entities/tokens/email-verification-token';

export abstract class IEmailTokenRepository {
  abstract getById(id: UUID, tx?: any): Promise<EmailVerificationToken | null>;
  abstract getByEmail(email: string, tx?: any): Promise<EmailVerificationToken | null>;
  abstract save(token: EmailVerificationToken, tx?: any): Promise<void>;
  abstract update(token: EmailVerificationToken, tx?: any): Promise<void>;
  abstract deleteById(id: UUID, tx?: any): Promise<void>;
}
