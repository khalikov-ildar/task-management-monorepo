import { Role } from '../../../domain/entities/user/role/role';
import { UUID } from 'node:crypto';

export type CurrentUserDetails = {
  userId: UUID;
  role: Role;
};

export abstract class ICurrentUserProvider {
  abstract getCurrentUserDetails(): CurrentUserDetails;
}
