import { Role as OrmRole } from '@prisma/client';
import { Role } from '../../../../domain/entities/user/role/role';
import { UserRoles } from '../../../../domain/entities/user/user-roles';
import { UUID } from 'node:crypto';

export class RoleMapper {
  public static toDomain(role: OrmRole): Role {
    return new Role(role.name as UserRoles, role.id as UUID);
  }

  public static toOrm(role: Role): OrmRole {
    return { id: role.id, name: role.name } satisfies OrmRole;
  }
}
