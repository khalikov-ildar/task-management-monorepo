export type TaskPriorities = 'low' | 'medium' | 'high';

export class TaskPriority {
  constructor(public readonly value: TaskPriorities) {}

  isEqualTo(to: TaskPriority): boolean {
    return this.value === to.value;
  }
}
