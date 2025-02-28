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
import { GetAssignedTasksQuery } from './get-assigned-tasks.query';

export class GetAssignedTasksUseCase implements IUseCase<GetAssignedTasksQuery, PaginatedResult<TaskSummary>> {
  constructor(
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly taskRepository: ITaskRepository,
    private readonly logger: ILogger,
  ) {}
  async execute(request: GetAssignedTasksQuery): Promise<Result<PaginatedResult<TaskSummary>, CustomError>> {
    const { userId, role } = this.currentUserProvider.getCurrentUserDetails();
    const context = GetAssignedTasksUseCase.name;
    const assigneeId = request.filterBy.assignees as UUID;

    this.logger.logInfo('Attempt to fetch assigned tasks', {
      context,
      userId,
      assigneeId,
    });

    if (!TaskPolicyService.canFetchAssigned(userId, role, assigneeId)) {
      this.logger.logInfo('Authorization failed: user has no permissions to fetch assigned tasks', {
        context,
        userId,
        assigneeId,
      });
      return err(TaskErrors.cannotGetTasksWithUserRole(role.name));
    }

    let tasks: PaginatedResult<TaskSummary>;
    try {
      tasks = await this.taskRepository.getAssigned(request);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch assigned tasks', { context }, e);
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Successfully fetched assigned tasks', { context, userId, assigneeId, tasksCount: tasks.totalCount });
    return ok(tasks);
  }
}
