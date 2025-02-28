import { UUID } from 'node:crypto';
import { CustomError } from '../../common/error/custom-error';
import { UserRoles } from '../../entities/user/user-roles';

export class UserErrors {
  public static InvalidCredentials(): CustomError {
    return new CustomError('Unauthorized', 'Invalid email or password');
  }

  public static UserAlreadyExists(): CustomError {
    return new CustomError('Conflict', 'User with given email already exists');
  }

  public static UserNotFound(options: { id?: UUID; email?: string }): CustomError {
    if (options.id) {
      return new CustomError('NotFound', `User with id: "${options.id}" not found`);
    }
    if (options.email) {
      return new CustomError('NotFound', `User with email: "${options.email}" not found`);
    }
    return new CustomError('NotFound', 'User was not found');
  }

  public static cannotCreateUserWithUserRole(role: UserRoles): CustomError {
    return new CustomError('Forbidden', `You cannot create users with your role, your role is: ${role}`);
  }

  public static cannotChangeUserWithUserRole(role: UserRoles): CustomError {
    return new CustomError('Forbidden', `You cannot change users with your role, your role is: ${role}`);
  }
}
