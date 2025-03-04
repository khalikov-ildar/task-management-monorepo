import { Role } from '../../../entities/user/role/role';
import { User } from '../../../entities/user/user';
import { UserRoles } from '../../../entities/user/user-roles';

export function createValidUser(role: UserRoles): User {
  const randomString = Math.random() * 150;
  return new User(`user${randomString}@user.com`, randomString.toString(), `user${randomString}`, new Role(role, 's-s-s-s-s'));
}
