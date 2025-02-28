import { Role } from '../../../../domain/entities/user/role/role';
import { UUID } from 'node:crypto';

export class RefreshTokensCommand {
  constructor(
    public readonly token: string,
    public readonly userId: UUID,
    public readonly role: Role,
  ) {}
}
