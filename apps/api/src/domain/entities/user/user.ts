import { randomUUID, UUID } from 'node:crypto';
import { Role } from './role/role';
import { Task } from '../task/task';
import { Solution } from '../solution/solution';
import { Review } from '../review/review';
import { RefreshToken } from '../tokens/refresh-token';
import { PasswordResetToken } from '../tokens/password-reset-token';
import { File } from '../file/file';

export class User {
  public id: UUID;

  constructor(
    public email: string,
    public password: string,
    public username: string,
    public role: Role,
    id?: UUID,
    public isEmailConfirmed: boolean = false,
    public ownedTasks: Task[] = [],
    public assignedTasks: Task[] = [],
    public solutions: Solution[] = [],
    public files: File[] = [],
    public reviews: Review[] = [],
    public refreshTokens: RefreshToken[] = [],
    public passwordResetTokens: PasswordResetToken[] = [],
  ) {
    this.id = id ?? randomUUID();
  }

  public changeProfile(email: string, name: string, password: string): void {
    this.email = email;
    this.username = name;
    this.password = password;
  }
}
