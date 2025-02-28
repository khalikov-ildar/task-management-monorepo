import { CustomError } from 'apps/api/src/domain/common/error/custom-error';
import { Task } from 'apps/api/src/domain/entities/task/task';
import { User } from 'apps/api/src/domain/entities/user/user';
import { TaskErrors } from 'apps/api/src/domain/errors/task/task.errors';
import { UserErrors } from 'apps/api/src/domain/errors/user/user.errors';
import { ITaskRepository } from 'apps/api/src/domain/repositories/task/i-task.repository';
import { IUserRepository } from 'apps/api/src/domain/repositories/user/i-user.repository';
import { Deadline } from 'apps/api/src/domain/value-objects/task-deadline';
import { TaskPriority } from 'apps/api/src/domain/value-objects/task-priority';
import { TaskStatus } from 'apps/api/src/domain/value-objects/task-status';
import { UUID } from 'node:crypto';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '../../../common/services/i-logger';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { TaskPolicyService } from '../../services/task-policy.service';
import { CreateTaskCommand } from './create-task.command';
import { TaskWithAssigneesResponse } from '../../dtos/task-with-assignees.response';

export class CreateTaskUseCase implements IUseCase<CreateTaskCommand, TaskWithAssigneesResponse> {
  constructor(
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly userRepository: IUserRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly logger: ILogger,
  ) {}

  async execute(request: CreateTaskCommand): Promise<Result<TaskWithAssigneesResponse, CustomError>> {
    const context = CreateTaskUseCase.name;
    const userId = this.currentUserProvider.getCurrentUserDetails().userId;

    this.logger.logInfo('Attempt to create task', { context, userId });

    const deadlineResult = Deadline.create(request.deadline);

    if (deadlineResult.isErr()) {
      this.logger.logInfo('Invalid deadline provided', { context, deadline: request.deadline });
      return err(deadlineResult.error);
    }

    const fetchingResult = await this.handleOwnerWithAssigneesFetch(userId, request, context);

    if (fetchingResult.isErr()) {
      return err(fetchingResult.error);
    }

    const [owner, assignees] = fetchingResult.value;

    if (!TaskPolicyService.canCreateTask(owner, assignees)) {
      return err(TaskErrors.taskAssigneesListMustContainOnlyLowerRoleUsers());
    }

    const priority = new TaskPriority(request.priority);
    const taskStatus = new TaskStatus();

    const task = Task.create(request.title, request.description, priority, deadlineResult.value, taskStatus, owner, assignees, []);

    if (task.isErr()) {
      return err(task.error);
    }

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Transaction for task creation started', { context });
        try {
          await this.taskRepository.create(task.value, tx);
        } catch (e) {
          this.logger.logError('An error occurred while trying save new task', { context }, e);
          throw e;
        }
        this.logger.logInfo('Transaction completed successfully', { context });
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Task successfully created', { context, taskId: task.value.id });

    return ok(TaskWithAssigneesResponse.fromAggregateToDto(task.value));
  }

  private async handleOwnerWithAssigneesFetch(
    userId: UUID,
    request: CreateTaskCommand,
    context: string,
  ): Promise<Result<[User, User[]], CustomError>> {
    const getOwnerQuery = this.userRepository.getById(userId);
    const getAssigneesQuery = this.userRepository.getMultipleByIds(request.assigneeIds);

    let owner: User | null;
    let assignees: User[];
    try {
      [owner, assignees] = await Promise.all([getOwnerQuery, getAssigneesQuery]);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch task owner and assignees', { context }, e);
      return err(UnexpectedError.create());
    }

    if (!owner) {
      this.logger.logInfo('User not found', { context, userId });
      return err(UserErrors.UserNotFound({ id: userId }));
    }

    if (request.assigneeIds.length !== assignees.length) {
      this.logger.logInfo('One or more of assignees users were not found', { context });
      return err(TaskErrors.someAssigneesNotFound());
    }

    return ok([owner, assignees]);
  }
}
