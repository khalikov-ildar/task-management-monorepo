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
import { TaskState } from './state/task.state';
import { TaskStateFactory } from './state/task-state.factory';
import { TaskExpiredState } from './state/task.expired-state';

export class Task {
  public static readonly minAssigneesCount: number = 1;
  public static readonly maxAssigneesCount: number = 10;
  public readonly id: UUID;
  public changedAt: Date;
  public solutions: Solution[];

  private state: TaskState;

  private constructor(
    public title: string,
    public description: string,
    public priority: TaskPriority,
    public deadline: Deadline,
    status: TaskStatus,
    public owner: User,
    public assignees: User[],
    id?: UUID,
    changedAt?: Date,
    solutions?: Solution[],
  ) {
    this.id = id ?? randomUUID();
    this.changedAt = changedAt ?? new Date();
    this.solutions = solutions ?? [];
    this.state = TaskStateFactory.create(status);
  }

  get status(): TaskStatus {
    return this.state.getStatus();
  }

  public static create(
    title: string,
    description: string,
    priority: TaskPriority,
    deadline: Deadline,
    status: TaskStatus,
    owner: User,
    assignees: User[],
    solutions?: Solution[],
    id?: UUID,
    changedAt?: Date,
  ): Result<Task, CustomError> {
    if (assignees.length < Task.minAssigneesCount || assignees.length > Task.maxAssigneesCount) {
      return err(TaskErrors.assigneesCountMustBeInRange(this.minAssigneesCount, this.maxAssigneesCount, assignees.length));
    }
    return ok(new Task(title, description, priority, deadline, status, owner, assignees, id, changedAt, solutions));
  }

  public markAsCompleted(): Result<void, CustomError> {
    if (Task.isExpired(this.deadline)) {
      this.state = new TaskExpiredState();
      this.changedAt = new Date();
    }

    return this.state.markAsCompleted().match(
      (state) => {
        this.state = state;
        this.changedAt = new Date();
        return ok(undefined);
      },
      (e) => err(e),
    );
  }

  public evaluateCompletion(review: Review): Result<void, CustomError> {
    return this.state.evaluateCompletion(review).match(
      (state) => {
        this.state = state;
        this.changedAt = new Date();
        return ok(undefined);
      },
      (e) => err(e),
    );
  }

  public changePriority(priority: TaskPriority): Result<void, CustomError> {
    return this.state.changePriority().match(
      () => {
        this.priority = priority;
        this.changedAt = new Date();
        return ok(undefined);
      },
      (e) => err(e),
    );
  }

  public static isExpired(deadline: Deadline): boolean {
    return Date.now() >= deadline.value.getTime();
  }
}
