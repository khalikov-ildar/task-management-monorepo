import { CustomError } from '../../../../domain/common/error/custom-error';
import { Task } from '../../../../domain/entities/task/task';
import { User } from '../../../../domain/entities/user/user';
import { TaskErrors } from '../../../../domain/errors/task/task.errors';
import { UserErrors } from '../../../../domain/errors/user/user.errors';
import { ITaskRepository } from '../../../../domain/repositories/task/i-task.repository';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { TaskPriority } from '../../../../domain/value-objects/task-priority';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '../../../common/services/i-logger';
import { TaskPolicyService } from '../../services/task-policy.service';
import { ChangeTaskPriorityCommand } from './change-task-priority.command';
import { TaskPriorityChangedResponse } from '../../dtos/task-priority-changed.response';
import { UUID } from 'node:crypto';

export class ChangeTaskPriorityUseCase implements IUseCase<ChangeTaskPriorityCommand, TaskPriorityChangedResponse> {
  constructor(
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly userRepository: IUserRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(request: ChangeTaskPriorityCommand): Promise<Result<TaskPriorityChangedResponse, CustomError>> {
    const context = ChangeTaskPriorityUseCase.name;

    const { userId, role } = this.currentUserProvider.getCurrentUserDetails();

    this.logger.logInfo('Attempt to change task priority', {
      taskId: request.taskId,
      userId,
      newPriority: request.newPriority,
      context,
    });

    const userFetchResult = await this.handleUserFetch(userId, context);
    if (userFetchResult.isErr()) {
      return err(userFetchResult.error);
    }

    const taskFetchResult = await this.handleTaskFetch(request.taskId, context);
    if (taskFetchResult.isErr()) {
      return err(taskFetchResult.error);
    }

    const task = taskFetchResult.value;

    if (!TaskPolicyService.canChangeTask(userId, role, task)) {
      this.logger.logInfo('User has no permissions to change task priority', { context, taskId: request.taskId, userId });
      return err(TaskErrors.cannotBeChangedByUser());
    }

    const newTaskPriority = new TaskPriority(request.newPriority);

    task.changePriority(newTaskPriority);

    try {
      await this.taskRepository.updatePriority(task);
    } catch (e) {
      this.logger.logError('An error occurred while trying to update priority for task', { context }, e);
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Task priority updated successfully', { context, taskId: request.taskId, newPriority: request.newPriority });

    return ok(TaskPriorityChangedResponse.create(task));
  }

  private async handleUserFetch(userId: UUID, context: string): Promise<Result<User, CustomError>> {
    let user: User | null;
    try {
      user = await this.userRepository.getById(userId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the user', { context }, e);
      return err(UnexpectedError.create());
    }

    if (!user) {
      this.logger.logInfo('User not found', { userId, context });
      return err(UserErrors.UserNotFound({ id: userId }));
    }

    return ok(user);
  }

  private async handleTaskFetch(taskId: UUID, context: string): Promise<Result<Task, CustomError>> {
    let task: Task | null;
    try {
      task = await this.taskRepository.getById(taskId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the task', { context }, e);
      return err(UnexpectedError.create());
    }

    if (!task) {
      this.logger.logInfo('Task not found', { taskId: taskId, context });
      return err(TaskErrors.taskNotFound(taskId));
    }

    return ok(task);
  }
}
