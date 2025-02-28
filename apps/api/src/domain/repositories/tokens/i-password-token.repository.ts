import { UUID } from 'node:crypto';
import { PasswordResetToken } from '../../entities/tokens/password-reset-token';

export abstract class IPasswordTokenRepository {
  abstract getById(id: UUID, tx?: any): Promise<PasswordResetToken | null>;
  abstract create(token: PasswordResetToken, tx?: any): Promise<void>;
  abstract update(token: PasswordResetToken, tx?: any): Promise<void>;
}
