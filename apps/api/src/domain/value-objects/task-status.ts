export type TaskStatuses = 'pending' | 'on-review' | 'approved' | 'expired';

const taskStatusList: TaskStatuses[] = ['approved', 'expired', 'pending', 'on-review'];

export class TaskStatus {
  public readonly value: TaskStatuses;
  private constructor(value: TaskStatuses) {
    this.value = value;
  }

  public static create(value?: TaskStatuses) {
    if (!value) {
      return new TaskStatus('pending');
    }

    if (!taskStatusList.includes(value)) {
      throw new Error('The invalid value is passed into task status');
    }

    return new TaskStatus(value);
  }

  isEqualTo(to: TaskStatus): boolean {
    return this.value === to.value;
  }
}
