import { Task } from '../../../domain/entities/task/task';
import { TaskSummary } from '../../../domain/entities/task/task-summary';
import { TaskPriorities } from '../../../domain/value-objects/task-priority';
import { TaskStatuses } from '../../../domain/value-objects/task-status';
import { UUID } from 'node:crypto';

export class TaskWithAssigneesResponse {
  private constructor(
    public readonly id: UUID,
    public readonly priority: TaskPriorities,
    public readonly deadline: Date,
    public readonly ownerId: UUID,
    public readonly assignees: UUID[],
    public readonly status: TaskStatuses,
    public readonly solutions?: UUID[],
  ) {}

  public static fromSummaryToDto(task: TaskSummary): TaskWithAssigneesResponse {
    return new TaskWithAssigneesResponse(
      task.id,
      task.priority,
      task.deadline,
      task.ownerId,
      task.assigneeIds,
      task.status,
      task.solutionIds,
    );
  }

  public static fromAggregateToDto(task: Task): TaskWithAssigneesResponse {
    return new TaskWithAssigneesResponse(
      task.id,
      task.priority.value,
      task.deadline.value,
      task.owner.id,
      task.assignees.map((a) => a.id),
      task.status.value,
      task?.solutions.map((s) => s.id),
    );
  }
}
