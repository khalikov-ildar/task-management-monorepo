export type TaskPriorities = 'low' | 'medium' | 'high';

const taskPriorietiesList: TaskPriorities[] = ['low', 'medium', 'high'];
export class TaskPriority {
  private constructor(public readonly value: TaskPriorities) {}

  public static create(value: TaskPriorities) {
    if (!taskPriorietiesList.includes(value)) {
      throw new Error('The invalid value is passed into task priority: ' + value);
    }

    return new TaskPriority(value);
  }

  isEqualTo(to: TaskPriority): boolean {
    return this.value === to.value;
  }
}
