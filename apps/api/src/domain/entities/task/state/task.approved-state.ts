import { TaskStatus } from '../../../../domain/value-objects/task-status';
import { TaskState } from './task.state';

export class TaskApprovedState extends TaskState {
  private static readonly status = TaskStatus.create('approved');

  constructor() {
    super();
  }

  getStatus(): TaskStatus {
    return TaskApprovedState.status;
  }
}
