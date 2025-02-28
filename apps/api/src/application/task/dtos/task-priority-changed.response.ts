import { Task } from '../../../domain/entities/task/task';
import { TaskPriorities } from '../../../domain/value-objects/task-priority';
import { UUID } from 'node:crypto';

export class TaskPriorityChangedResponse {
  private constructor(
    public readonly taskId: UUID,
    public readonly title: string,
    public readonly priority: TaskPriorities,
  ) {}

  public static create(task: Task): TaskPriorityChangedResponse {
    return new TaskPriorityChangedResponse(task.id, task.title, task.priority.value);
  }
}
