import { Role } from '../../../domain/entities/user/role/role';
import { UUID } from 'node:crypto';
import { TokenPair } from '../dtos/token-pair';
import { TokenType } from '../dtos/token-type';

export abstract class IAuthenticationTokenProvider {
  abstract signTokenPair(userId: UUID, role: Role): Promise<TokenPair>;
  abstract verifyRefresh(token: string): Promise<TokenType>;
  abstract verifyAccess(token: string): Promise<TokenType>;
}
