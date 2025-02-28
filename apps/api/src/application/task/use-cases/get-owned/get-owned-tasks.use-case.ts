import { CustomError } from '../../../../domain/common/error/custom-error';
import { PaginatedResult } from '../../../../domain/common/repository/paginated-result';
import { TaskSummary } from '../../../../domain/entities/task/task-summary';
import { TaskErrors } from '../../../../domain/errors/task/task.errors';
import { ITaskRepository } from '../../../../domain/repositories/task/i-task.repository';
import { UUID } from 'node:crypto';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '../../../common/services/i-logger';
import { TaskPolicyService } from '../../services/task-policy.service';
import { GetOwnedTasksQuery } from './get-owned-tasks.query';

export class GetOwnedTasksUseCase implements IUseCase<GetOwnedTasksQuery, PaginatedResult<TaskSummary>> {
  constructor(
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly taskRepository: ITaskRepository,
    private readonly logger: ILogger,
  ) {}
  async execute(request: GetOwnedTasksQuery): Promise<Result<PaginatedResult<TaskSummary>, CustomError>> {
    const { userId, role } = this.currentUserProvider.getCurrentUserDetails();
    const context = GetOwnedTasksUseCase.name;
    const taskOwnerId = request.filterBy.owner as UUID;

    this.logger.logInfo('Attempt to fetch owned tasks', { context, userId, taskOwnerId });

    if (!TaskPolicyService.canFetchOwned(userId, role, taskOwnerId)) {
      this.logger.logInfo('Authorization failed: user has no permissions to fetch owned tasks', { context, userId, taskOwnerId });
      return err(TaskErrors.cannotGetTasksWithUserRole(role.name));
    }
    let tasks: PaginatedResult<TaskSummary>;
    try {
      tasks = await this.taskRepository.getOwned(request);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch owned tasks', { context }, e);
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully fetched owned tasks', { context, userId, taskOwnerId, tasksCount: tasks.totalCount });
    return ok(tasks);
  }
}
