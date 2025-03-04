import { CustomError } from '../../../../domain/common/error/custom-error';
import { PaginatedResult } from '../../../../domain/common/repository/paginated-result';
import { TaskSummary } from '../../../../domain/entities/task/task-summary';
import { TaskErrors } from '../../../../domain/errors/task/task.errors';
import { ITaskRepository } from '../../../../domain/repositories/task/i-task.repository';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '@app/shared';
import { TaskPolicyService } from '../../services/task-policy.service';
import { GetOwnedTasksQuery } from './get-owned-tasks.query';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class GetOwnedTasksUseCase implements IUseCase<GetOwnedTasksQuery, PaginatedResult<TaskSummary>> {
  constructor(
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly taskRepository: ITaskRepository,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(GetOwnedTasksUseCase.name, this._genericLogger);

  async execute(request: GetOwnedTasksQuery): Promise<Result<PaginatedResult<TaskSummary>, CustomError>> {
    const { userId, role } = this.currentUserProvider.getCurrentUserDetails();
    const taskOwnerId = request.ownerId;

    this.logger.logInfo('Attempt to fetch owned tasks', { userId, taskOwnerId });

    if (!TaskPolicyService.canFetchOwned(userId, role, taskOwnerId)) {
      this.logger.logInfo('Authorization failed: user has no permissions to fetch owned tasks', { userId, taskOwnerId });
      return err(TaskErrors.cannotGetTasksWithUserRole(role.name));
    }

    const tasksFetchingResult = await this.handleTasksFetching(request);
    if (tasksFetchingResult.isErr()) {
      return err(tasksFetchingResult.error);
    }

    const tasks = tasksFetchingResult.value;

    this.logger.logInfo('Successfully fetched owned tasks', { userId, taskOwnerId, tasksCount: tasks.totalCount });
    return ok(tasks);
  }

  private async handleTasksFetching(request: GetOwnedTasksQuery): Promise<Result<PaginatedResult<TaskSummary>, CustomError>> {
    let tasks: PaginatedResult<TaskSummary>;
    try {
      tasks = await this.taskRepository.getOwned(request);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch owned tasks', {}, e);
      return err(UnexpectedError.create());
    }

    return ok(tasks);
  }
}
