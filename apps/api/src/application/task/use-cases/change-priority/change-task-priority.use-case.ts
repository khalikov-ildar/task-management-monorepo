import { CustomError } from '../../../../domain/common/error/custom-error';
import { Task } from '../../../../domain/entities/task/task';
import { User } from '../../../../domain/entities/user/user';
import { TaskErrors } from '../../../../domain/errors/task/task.errors';
import { UserErrors } from '../../../../domain/errors/user/user.errors';
import { ITaskRepository } from '../../../../domain/repositories/task/i-task.repository';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { TaskPriority } from '../../../../domain/value-objects/task-priority';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '@app/shared';
import { TaskPolicyService } from '../../services/task-policy.service';
import { ChangeTaskPriorityCommand } from './change-task-priority.command';
import { TaskPriorityChangedResponse } from '../../dtos/task-priority-changed.response';
import { UUID } from 'node:crypto';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class ChangeTaskPriorityUseCase implements IUseCase<ChangeTaskPriorityCommand, TaskPriorityChangedResponse> {
  constructor(
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly userRepository: IUserRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(ChangeTaskPriorityUseCase.name, this._genericLogger);

  async execute(request: ChangeTaskPriorityCommand): Promise<Result<TaskPriorityChangedResponse, CustomError>> {
    const { userId, role } = this.currentUserProvider.getCurrentUserDetails();

    this.logger.logInfo('Attempt to change task priority', {
      taskId: request.taskId,
      userId,
      newPriority: request.newPriority,
    });

    const userFetchResult = await this.handleUserFetch(userId);
    if (userFetchResult.isErr()) {
      return err(userFetchResult.error);
    }

    const taskFetchResult = await this.handleTaskFetch(request.taskId);
    if (taskFetchResult.isErr()) {
      return err(taskFetchResult.error);
    }

    const task = taskFetchResult.value;

    if (!TaskPolicyService.canChangeTask(userId, role, task)) {
      this.logger.logInfo('User has no permissions to change task priority', { taskId: request.taskId, userId });
      return err(TaskErrors.cannotBeChangedByUser());
    }

    const newTaskPriority = TaskPriority.create(request.newPriority);

    task.changePriority(newTaskPriority);

    try {
      await this.taskRepository.updatePriority(task);
    } catch (e) {
      this.logger.logError('An error occurred while trying to update priority for task', {}, e);
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Task priority updated successfully', { taskId: request.taskId, newPriority: request.newPriority });

    return ok(TaskPriorityChangedResponse.create(task));
  }

  private async handleUserFetch(userId: UUID): Promise<Result<User, CustomError>> {
    let user: User | null;
    try {
      user = await this.userRepository.getById(userId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the user', {}, e);
      return err(UnexpectedError.create());
    }

    if (!user) {
      this.logger.logInfo('User not found', { userId });
      return err(UserErrors.UserNotFound({ id: userId }));
    }

    return ok(user);
  }

  private async handleTaskFetch(taskId: UUID): Promise<Result<Task, CustomError>> {
    let task: Task | null;
    try {
      task = await this.taskRepository.getById(taskId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the task', {}, e);
      return err(UnexpectedError.create());
    }

    if (!task) {
      this.logger.logInfo('Task not found', { taskId: taskId });
      return err(TaskErrors.taskNotFound(taskId));
    }

    return ok(task);
  }
}
