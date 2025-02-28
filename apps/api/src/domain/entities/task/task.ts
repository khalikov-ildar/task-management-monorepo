import { err, ok, Result } from 'neverthrow';
import { TaskPriority } from '../../value-objects/task-priority';
import { CustomError } from '../../common/error/custom-error';
import { TaskErrors } from '../../errors/task/task.errors';
import { TaskStatus } from '../../value-objects/task-status';
import { Review } from '../review/review';
import { randomUUID, UUID } from 'node:crypto';
import { Solution } from '../solution/solution';
import { Deadline } from '../../value-objects/task-deadline';
import { User } from '../user/user';

export class Task {
  private static readonly minAssigneesCount: number = 1;
  private static readonly maxAssigneesCount: number = 10;
  public readonly id: UUID;
  public changedAt: Date;
  public solutions: Solution[];

  private constructor(
    public title: string,
    public description: string,
    public priority: TaskPriority,
    public deadline: Deadline,
    public status: TaskStatus,
    public owner: User,
    public assignees: User[],
    id?: UUID,
    changedAt?: Date,
    solutions?: Solution[],
  ) {
    this.id = id ?? randomUUID();
    this.changedAt = changedAt ?? new Date();
    this.solutions = solutions ?? undefined;
  }

  public static create(
    title: string,
    description: string,
    priority: TaskPriority,
    deadline: Deadline,
    status: TaskStatus,
    owner: User,
    assignees: User[],
    solutions: Solution[],
    id?: UUID,
    changedAt?: Date,
  ): Result<Task, CustomError> {
    if (assignees.length < this.minAssigneesCount || assignees.length > this.maxAssigneesCount) {
      return err(TaskErrors.assigneesCountMustBeInRange(this.minAssigneesCount, this.maxAssigneesCount, assignees.length));
    }

    return ok(new Task(title, description, priority, deadline, status, owner, assignees, id, changedAt, solutions));
  }

  public markAsCompleted(): Result<void, CustomError> {
    if (this.status.value !== 'pending') {
      return err(TaskErrors.taskStatusIsNotPending());
    }

    if (this.isExpired()) {
      this.status = new TaskStatus('expired');
      this.changedAt = new Date();
      return err(TaskErrors.taskIsExpired());
    }

    this.status = new TaskStatus('on-review');
    this.changedAt = new Date();

    return ok(undefined);
  }

  public evaluateCompletion(review: Review): Result<void, CustomError> {
    if (this.status.value !== 'on-review') {
      return err(TaskErrors.taskStatusIsNotOnReview());
    }

    if (review.status.value === 'accepted') {
      const approvedStatus = new TaskStatus('approved');
      this.status = approvedStatus;
    } else {
      const pendingStatus = new TaskStatus('pending');
      this.status = pendingStatus;
    }

    this.changedAt = new Date();
    return ok(undefined);
  }

  public isExpired(): boolean {
    if (Date.now() >= this.deadline.value.getTime()) {
      return true;
    }
    return false;
  }

  public changePriority(priority: TaskPriority): Result<void, CustomError> {
    if (this.status.value !== 'pending') {
      return err(TaskErrors.taskPriorityCanBeChangedOnlyOnPendingTasks(this.status.value));
    }
    this.priority = priority;
    this.changedAt = new Date();
    return ok(undefined);
  }
}
