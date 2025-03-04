import { CustomError } from '../../../../domain/common/error/custom-error';
import { Task } from '../../../../domain/entities/task/task';
import { User } from '../../../../domain/entities/user/user';
import { TaskErrors } from '../../../../domain/errors/task/task.errors';
import { UserErrors } from '../../../../domain/errors/user/user.errors';
import { ITaskRepository } from '../../../../domain/repositories/task/i-task.repository';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { Deadline } from '../../../../domain/value-objects/task-deadline';
import { TaskPriority } from '../../../../domain/value-objects/task-priority';
import { TaskStatus } from '../../../../domain/value-objects/task-status';
import { UUID } from 'node:crypto';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '@app/shared';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { TaskPolicyService } from '../../services/task-policy.service';
import { CreateTaskCommand } from './create-task.command';
import { TaskWithAssigneesResponse } from '../../dtos/task-with-assignees.response';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class CreateTaskUseCase implements IUseCase<CreateTaskCommand, TaskWithAssigneesResponse> {
  constructor(
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly userRepository: IUserRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(CreateTaskUseCase.name, this._genericLogger);

  async execute(request: CreateTaskCommand): Promise<Result<TaskWithAssigneesResponse, CustomError>> {
    const userId = this.currentUserProvider.getCurrentUserDetails().userId;

    this.logger.logInfo('Attempt to create task', { userId });

    const deadlineResult = Deadline.create(request.deadline);

    if (deadlineResult.isErr()) {
      this.logger.logInfo('Invalid deadline provided', { deadline: request.deadline });
      return err(deadlineResult.error);
    }

    const fetchingResult = await this.handleOwnerWithAssigneesFetch(userId, request);

    if (fetchingResult.isErr()) {
      return err(fetchingResult.error);
    }

    const [owner, assignees] = fetchingResult.value;

    if (!TaskPolicyService.canCreateTask(owner, assignees)) {
      return err(TaskErrors.taskAssigneesListMustContainOnlyLowerRoleUsers());
    }

    const priority = TaskPriority.create(request.priority);
    const taskStatus = TaskStatus.create();

    const task = Task.create(request.title, request.description, priority, deadlineResult.value, taskStatus, owner, assignees, []);

    if (task.isErr()) {
      return err(task.error);
    }

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Transaction for task creation started', {});
        try {
          await this.taskRepository.create(task.value, tx);
        } catch (e) {
          this.logger.logError('An error occurred while trying save new task', {}, e);
          throw e;
        }
        this.logger.logInfo('Transaction completed successfully', {});
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Task successfully created', { taskId: task.value.id });

    return ok(TaskWithAssigneesResponse.fromAggregateToDto(task.value));
  }

  private async handleOwnerWithAssigneesFetch(userId: UUID, request: CreateTaskCommand): Promise<Result<[User, User[]], CustomError>> {
    const getOwnerQuery = this.userRepository.getById(userId);
    const getAssigneesQuery = this.userRepository.getMultipleByIds(request.assigneeIds);

    let owner: User | null;
    let assignees: User[];
    try {
      [owner, assignees] = await Promise.all([getOwnerQuery, getAssigneesQuery]);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch task owner and assignees', {}, e);
      return err(UnexpectedError.create());
    }

    if (!owner) {
      this.logger.logInfo('User not found', { userId });
      return err(UserErrors.UserNotFound({ id: userId }));
    }

    if (request.assigneeIds.length !== assignees.length) {
      this.logger.logInfo('One or more of assignees users were not found', {});
      return err(TaskErrors.someAssigneesNotFound());
    }

    return ok([owner, assignees]);
  }
}
