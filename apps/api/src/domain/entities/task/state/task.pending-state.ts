import { TaskStatus } from '../../../../domain/value-objects/task-status';
import { TaskState } from './task.state';
import { CustomError } from '../../../../domain/common/error/custom-error';
import { Result, ok } from 'neverthrow';
import { TaskOnReviewState } from './task.on-review-state';

export class TaskPendingState extends TaskState {
  private static readonly status = TaskStatus.create('pending');

  constructor() {
    super();
  }

  getStatus(): TaskStatus {
    return TaskPendingState.status;
  }

  override markAsCompleted(): Result<TaskState, CustomError> {
    return ok(new TaskOnReviewState());
  }

  override changePriority(): Result<void, CustomError> {
    return ok(undefined);
  }
}
