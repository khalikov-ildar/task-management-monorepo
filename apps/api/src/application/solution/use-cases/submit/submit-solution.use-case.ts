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
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ILogger } from '../../../common/services/i-logger';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { SubmitSolutionCommand } from './submit-solution.command';
import { SolutionCreatedResponse } from '../../dtos/solution-created.response';
import { FileErrors } from '../../../../domain/errors/file/file-errors';

export class SubmitSolutionUseCase implements IUseCase<SubmitSolutionCommand, SolutionCreatedResponse> {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly taskRepository: ITaskRepository,
    private readonly solutionRepository: ISolutionRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly logger: ILogger,
  ) {}

  async execute(request: SubmitSolutionCommand): Promise<Result<SolutionCreatedResponse, CustomError>> {
    const context = SubmitSolutionUseCase.name;
    const { userId } = this.currentUserProvider.getCurrentUserDetails();

    this.logger.logInfo('Attempt to submit the solution', { context, userId });

    const fileFetchingResult = await this.handleFileFetching(request.fileId, context);
    if (fileFetchingResult.isErr()) {
      return err(fileFetchingResult.error);
    }

    const file = fileFetchingResult.value;

    const taskFetchingResult = await this.handleTaskFetching(request.taskId, context);
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
          this.logger.logError('An error occurred while trying to update status of task', { context, taskId: task.id });
          return err(UnexpectedError.create());
        }
      }
      return err(markingAsCompleteResult.error);
    }

    const solution = new Solution(task, file, userId, request.additionalDetails);

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Transaction for updating task status and saving soluiton started', { context });

        const updateStatus = this.taskRepository.updateStatus(task, tx);
        const createSolution = this.solutionRepository.create(solution, tx);

        try {
          await Promise.all([updateStatus, createSolution]);
        } catch (e) {
          this.logger.logError('An error occurred while trying to update status and save solution', { context, taskId: task.id }, e);
          throw e;
        }

        this.logger.logInfo('Transaction successfully completed', { context });
      });
    } catch (e) {
      return err(UnexpectedError.create());
    }

    return ok(SolutionCreatedResponse.fromDomain(solution));
  }

  private async handleFileFetching(fileId: UUID, context: string): Promise<Result<File, CustomError>> {
    let file: File | null;
    try {
      file = await this.fileRepository.getById(fileId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch the file', { context, fileId }, e);
      return err(UnexpectedError.create());
    }

    if (!file) {
      this.logger.logInfo('File was not found', { context, fileId });
      return err(FileErrors.NotFound(fileId));
    }

    return ok(file);
  }

  private async handleTaskFetching(taskId: UUID, context: string): Promise<Result<Task, CustomError>> {
    let task: Task | null;
    try {
      task = await this.taskRepository.getById(taskId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch task', { context, taskId }, e);
      return err(UnexpectedError.create());
    }

    if (!task) {
      this.logger.logInfo('Task was not found', { context, taskId });
      return err(TaskErrors.taskNotFound(taskId));
    }

    return ok(task);
  }
}
