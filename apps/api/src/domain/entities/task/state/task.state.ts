/* eslint-disable @typescript-eslint/no-unused-vars */
import { CustomError } from '../../../../domain/common/error/custom-error';
import { TaskErrors } from '../../../../domain/errors/task/task.errors';
import { TaskStatus } from '../../../../domain/value-objects/task-status';
import { Result, err } from 'neverthrow';
import { Review } from '../../review/review';

export abstract class TaskState {
  markAsCompleted(): Result<TaskState, CustomError> {
    return err(TaskErrors.taskStatusIsNotPending());
  }

  evaluateCompletion(r: Review): Result<TaskState, CustomError> {
    return err(TaskErrors.taskStatusIsNotOnReview());
  }

  changePriority(): Result<void, CustomError> {
    return err(TaskErrors.taskStatusIsNotPending());
  }

  abstract getStatus(): TaskStatus;
}
