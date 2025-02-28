export type TaskStatuses = 'pending' | 'on-review' | 'approved' | 'expired';

export class TaskStatus {
  public readonly value: TaskStatuses;
  constructor(value?: TaskStatuses) {
    this.value = value ?? 'pending';
  }

  isEqualTo(to: TaskStatus): boolean {
    return this.value === to.value;
  }
}
