import { User } from '../../../domain/entities/user/user';
import { UUID } from 'node:crypto';

export interface SanitizedUser {
  id: UUID;
  email: string;
  name: string;
}

export function sanitizeUser(user: User): SanitizedUser {
  return { email: user.email, id: user.id, name: user.username };
}
