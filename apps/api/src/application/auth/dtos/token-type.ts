import { Role } from '../../../domain/entities/user/role/role';
import { UUID } from 'node:crypto';

export type TokenType = {
  sub: UUID;
  role: Role;
};
