import { CustomError } from '../../../../domain/common/error/custom-error';
import { Solution } from '../../../../domain/entities/solution/solution';
import { Task } from '../../../../domain/entities/task/task';
import { File } from '../../../../domain/entities/file/file';
import { TaskErrors } from '../../../../domain/errors/task/task.errors';
import { IFileRepository } from '../../../../domain/repositories/file/i-file.repository';
import { ISolutionRepository } from '../../../../domain/repositories/solution/i-solution.repository';
import { ITaskRepository } from '../../../../domain/repositories/task/i-task.repository';
import { UUID } from 'node:crypto';
import { Result, err, ok } from 'neverthrow';
import { UnexpectedError } from '../../../../domain/common/error/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '@app/shared';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { SubmitSolutionCommand } from './submit-solution.command';
import { SolutionCreatedResponse } from '../../dtos/solution-created.response';
import { FileErrors } from '../../../../domain/errors/file/file-errors';
import { ContextualLogger } from '../../../common/services/contextual-logger';

export class SubmitSolutionUseCase implements IUseCase<SubmitSolutionCommand, SolutionCreatedResponse> {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly taskRepository: ITaskRepository,
    private readonly solutionRepository: ISolutionRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly _genericLogger: ILogger,
  ) {}

  private readonly logger = new ContextualLogger(SubmitSolutionUseCase.name, this._genericLogger);

  async execute(request: SubmitSolutionCommand): Promise<Result<SolutionCreatedResponse, CustomError>> {
    const { userId } = this.currentUserProvider.getCurrentUserDetails();

    this.logger.logInfo('Attempt to submit the solution', { userId });

    const fileFetchingResult = await this.handleFileFetching(request.fileId);
    if (fileFetchingResult.isErr()) {
      return err(fileFetchingResult.error);
    }

    const file = fileFetchingResult.value;

    const taskFetchingResult = await this.handleTaskFetching(request.taskId);
    if (taskFetchingResult.isErr()) {
      return err(taskFetchingResult.error);
    }

    const task = taskFetchingResult.value;

    const markingAsCompleteResult = task.markAsCompleted();

    if (markingAsCompleteResult.isErr()) {
      if (markingAsCompleteResult.error.message === TaskErrors.taskIsExpired().message) {
        try {
          await this.taskRepository.updateStatus(task);
        } catch (e) {
          this.logger.logError('An error occurred while trying to update status of task', { taskId: task.id });
          return err(UnexpectedError.create());
        }
      }
      return err(markingAsCompleteResult.error);
    }

    const solution = new Solution(task, file, userId, request.additionalDetails);

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Transaction for updating task status and saving soluiton started', {});

        const updateStatus = this.taskRepository.updateStatus(task, tx);
        const createSolution = this.solutionRepository.create(solution, tx);

        try {
          await Promise.all([updateStatus, createSolution]);
        } catch (e) {
          this.logger.logError('An error occurred while trying to update status and save solution', { taskId: task.id }, e);
          throw e;
        }

        this.logger.logInfo('Transaction successfully completed', {});
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    this.logger.logInfo('Solution successfully created', { solutionId: solution.id });

    return ok(SolutionCreatedResponse.fromDomain(solution));
  }

  private async handleFileFetching(fileId: UUID): Promise<Result<File, CustomError>> {
    let file: File | null;
    try {
      file = await this.fileRepository.getById(fileId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the file', { fileId }, e);
      return err(UnexpectedError.create());
    }

    if (!file) {
      this.logger.logInfo('File was not found', { fileId });
      return err(FileErrors.NotFound(fileId));
    }

    return ok(file);
  }

  private async handleTaskFetching(taskId: UUID): Promise<Result<Task, CustomError>> {
    let task: Task | null;
    try {
      task = await this.taskRepository.getById(taskId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch task', { taskId }, e);
      return err(UnexpectedError.create());
    }

    if (!task) {
      this.logger.logInfo('Task was not found', { taskId });
      return err(TaskErrors.taskNotFound(taskId));
    }

    return ok(task);
  }
}
