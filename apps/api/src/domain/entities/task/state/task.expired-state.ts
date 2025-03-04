import { TaskStatus } from '../../../../domain/value-objects/task-status';
import { TaskState } from './task.state';
import { err, Result } from 'neverthrow';
import { CustomError } from '../../../common/error/custom-error';
import { TaskErrors } from '../../../errors/task/task.errors';

export class TaskExpiredState extends TaskState {
  private static readonly status = TaskStatus.create('expired');

  constructor() {
    super();
  }

  getStatus(): TaskStatus {
    return TaskExpiredState.status;
  }

  override markAsCompleted(): Result<TaskState, CustomError> {
    return err(TaskErrors.taskIsExpired());
  }
}
