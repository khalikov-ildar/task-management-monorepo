import { UUID } from 'node:crypto';
import { User } from '../../entities/user/user';

export abstract class IUserRepository {
  abstract getMultipleByIds(ids: UUID[], tx?: any): Promise<User[]>;
  abstract getById(id: UUID, tx?: any): Promise<User | null>;
  abstract getByEmail(email: string, tx?: any): Promise<User | null>;
  abstract save(user: User, tx?: any): Promise<void>;
  abstract update(user: User, tx?: any): Promise<void>;
  abstract changePasswordById(userId: UUID, newPassword: string, tx?: any): Promise<void>;
  abstract changeEmailConfirmationByEmail(email: string, isEmailConfirmed: boolean, tx?: any): Promise<void>;
  abstract delete(user: User, tx?: any): Promise<void>;
}
