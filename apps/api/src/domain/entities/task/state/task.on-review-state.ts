import { TaskStatus } from '../../../../domain/value-objects/task-status';
import { TaskState } from './task.state';
import { ok, Result } from 'neverthrow';
import { TaskApprovedState } from './task.approved-state';
import { TaskPendingState } from './task.pending-state';
import { CustomError } from '../../../../domain/common/error/custom-error';
import { Review } from '../../review/review';

export class TaskOnReviewState extends TaskState {
  private static readonly status = TaskStatus.create('on-review');

  constructor() {
    super();
  }

  getStatus(): TaskStatus {
    return TaskOnReviewState.status;
  }

  override evaluateCompletion(review: Review): Result<TaskState, CustomError> {
    return ok(review.status.value === 'accepted' ? new TaskApprovedState() : new TaskPendingState());
  }
}
