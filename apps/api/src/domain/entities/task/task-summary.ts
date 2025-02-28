import { UUID } from 'crypto';
import { TaskPriorities } from '../../value-objects/task-priority';
import { TaskStatuses } from '../../value-objects/task-status';

export class TaskSummary {
  public solutionIds?: UUID[];

  constructor(
    public readonly id: UUID,
    public title: string,
    public description: string,
    public priority: TaskPriorities,
    public deadline: Date,
    public status: TaskStatuses,
    public readonly ownerId: UUID,
    public assigneeIds: UUID[],
    public changedAt: Date,
    solutionIds?: UUID[],
  ) {
    this.solutionIds = solutionIds ?? undefined;
  }
}
