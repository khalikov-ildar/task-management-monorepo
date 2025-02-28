import { UUID } from 'node:crypto';
import { RefreshToken } from '../../entities/tokens/refresh-token';

export abstract class IRefreshTokenRepository {
  abstract getByToken(token: string, tx?: any): Promise<RefreshToken | null>;
  abstract getAllActiveTokensByUserId(userId: UUID, tx?: any): Promise<RefreshToken[]>;
  abstract save(token: RefreshToken, tx?: any): Promise<void>;
  abstract updateToken(token: RefreshToken, tx?: any): Promise<void>;
  abstract updateMultipleTokens(tokens: RefreshToken[], tx: any): Promise<void>;
}
