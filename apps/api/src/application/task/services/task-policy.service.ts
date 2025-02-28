import { Task } from '../../../domain/entities/task/task';
import { Role } from '../../../domain/entities/user/role/role';
import { User } from '../../../domain/entities/user/user';
import { UserRoles } from '../../../domain/entities/user/user-roles';
import { UUID } from 'node:crypto';

export class TaskPolicyService {
  public static canFetchOwned(userId: UUID, role: Role, ownerId: UUID): boolean {
    if (userId !== ownerId && role.name !== UserRoles.Admin) {
      return false;
    }
    return true;
  }

  public static canFetchAssigned(userId: UUID, role: Role, assigneeId: UUID): boolean {
    if (userId !== assigneeId && role.name !== UserRoles.Admin) {
      return false;
    }
    return true;
  }

  public static canCreateTask(owner: User, assignees: User[]): boolean {
    const ownerRole = owner.role.name;
    const assigneesRoles = assignees.map((a) => a.role.name);
    switch (ownerRole) {
      case 'Member':
        return false;
      case 'Supervisor':
        return !assigneesRoles.includes(UserRoles.Supervisor) && !assigneesRoles.includes(UserRoles.Admin);
      case 'Admin':
        return !assigneesRoles.includes(UserRoles.Admin);
    }
  }

  public static canChangeTask(userId: UUID, role: Role, task: Task): boolean {
    if (role.name === UserRoles.Member || (role.name === UserRoles.Supervisor && task.owner.id !== userId)) {
      return false;
    }
    return true;
  }
}
