import { UUID } from 'node:crypto';
import { CustomError } from '../../common/error/custom-error';
import { UserRoles } from '../../entities/user/user-roles';
import { TaskStatuses } from '../../value-objects/task-status';

export class TaskErrors {
  public static userIsAlreadyAssignedToTask(userId: UUID): CustomError {
    return new CustomError('Validation', `User with id: "${userId}" is already assigned to the task`);
  }

  public static taskCannotHaveDuplicateAssignees(): CustomError {
    return new CustomError('Validation', 'Task assignees list should contain only unique values (no duplicate values allowed)');
  }

  public static assigneesCountMustBeInRange(min: number, max: number, provided: number): CustomError {
    return new CustomError(
      'Validation',
      `Assignees count must be in range ${min} and ${max} inclusive. You provided ${provided} assignees`,
    );
  }

  public static someAssigneesNotFound(): CustomError {
    return new CustomError('Validation', 'Some of the assignees were not found');
  }

  public static taskNotFound(id: UUID): CustomError {
    return new CustomError('NotFound', `Task with id: "${id}" was not found`);
  }

  public static taskAssigneesListMustContainOnlyLowerRoleUsers(): CustomError {
    return new CustomError('Validation', 'Task cannot be created by member and assignees list must contain users of lower role than yours');
  }

  public static cannotBeChangedByUser(): CustomError {
    return new CustomError('Forbidden', 'Task cannot be changed by you');
  }

  public static taskIsExpired(): CustomError {
    return new CustomError('Validation', 'The deadline of task is over. Task status set to expired');
  }

  public static taskPriorityCanBeChangedOnlyOnPendingTasks(currentStatus: TaskStatuses): CustomError {
    return new CustomError('Validation', `Task priority can be changed only on pending tasks, the task's status is ${currentStatus}`);
  }

  public static taskStatusIsNotPending(): CustomError {
    return new CustomError('Validation', 'The task status must be "pending" to mark it as completed');
  }

  public static taskStatusIsNotOnReview(): CustomError {
    return new CustomError('Validation', 'The task status must be "on-review" to review it');
  }

  public static cannotGetTasksWithUserRole(role: UserRoles): CustomError {
    return new CustomError('Forbidden', `The task cannot be fetched with your role. Your role is: ${role}`);
  }
}
