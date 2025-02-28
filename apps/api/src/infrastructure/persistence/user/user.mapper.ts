import { User } from '../../../domain/entities/user/user';
import { UserWithRoles } from './user-orm.dtos';
import { Role } from '../../../domain/entities/user/role/role';
import { UserRoles } from '../../../domain/entities/user/user-roles';
import { UUID } from 'node:crypto';
import { User as OrmUser } from '@prisma/client';

export class UserMapper {
  public static toDomainWithRole(x: UserWithRoles): User {
    return new User(x.email, x.password, x.username, new Role(x.role.name as UserRoles, x.role.id as UUID), x.id as UUID);
  }

  public static toOrm(u: User): OrmUser {
    return {
      id: u.id,
      email: u.email,
      username: u.username,
      password: u.password,
      roleId: u.role.id,
      isEmailConfirmed: u.isEmailConfirmed,
    } satisfies OrmUser;
  }

  public static toDomainWithoutRole(x: OrmUser): User {
    return new User(x.email, x.password, x.username, undefined as Role, x.id as UUID, x.isEmailConfirmed);
  }
}
