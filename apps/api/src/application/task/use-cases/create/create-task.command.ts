import { TaskPriorities } from '../../../../domain/value-objects/task-priority';
import { UUID } from 'crypto';

export class CreateTaskCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly priority: TaskPriorities,
    public readonly deadline: Date,
    public readonly assigneeIds: UUID[],
  ) {}
}
