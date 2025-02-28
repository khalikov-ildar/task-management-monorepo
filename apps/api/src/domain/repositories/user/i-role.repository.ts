import { UUID } from 'node:crypto';
import { UserRoles } from '../../entities/user/user-roles';
import { Role } from '../../entities/user/role/role';

export abstract class IRoleRepository {
  abstract getById(id: UUID, tx?: any): Promise<Role | null>;
  abstract getByName(name: UserRoles, tx?: any): Promise<Role | null>;
  abstract save(role: Role, tx?: any): Promise<void>;
  abstract update(role: Role, tx?: any): Promise<void>;
}
