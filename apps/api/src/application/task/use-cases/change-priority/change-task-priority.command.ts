import { TaskPriorities } from '../../../../domain/value-objects/task-priority';
import { UUID } from 'node:crypto';

export class ChangeTaskPriorityCommand {
  constructor(
    public readonly taskId: UUID,
    public readonly newPriority: TaskPriorities,
  ) {}
}
