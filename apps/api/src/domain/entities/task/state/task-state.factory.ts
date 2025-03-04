import { TaskStatus } from '../../../value-objects/task-status';
import { TaskApprovedState } from './task.approved-state';
import { TaskExpiredState } from './task.expired-state';
import { TaskOnReviewState } from './task.on-review-state';
import { TaskPendingState } from './task.pending-state';
import { TaskState } from './task.state';

export class TaskStateFactory {
  public static create(status: TaskStatus): TaskState {
    switch (status.value) {
      case 'pending':
        return new TaskPendingState();
      case 'on-review':
        return new TaskOnReviewState();
      case 'approved':
        return new TaskApprovedState();
      case 'expired':
        return new TaskExpiredState();
    }
  }
}
