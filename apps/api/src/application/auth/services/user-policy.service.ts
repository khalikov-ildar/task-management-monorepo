import { Role } from '../../../domain/entities/user/role/role';
import { UserRoles } from '../../../domain/entities/user/user-roles';

export class UserPolicyService {
  public static canChangeProfile(role: Role): boolean {
    return role.name === UserRoles.Admin;
  }

  public static canCreateUser(role: Role): boolean {
    return role.name === UserRoles.Admin;
  }
}
