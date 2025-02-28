export type SolutionStatuses = 'pending' | 'reviewed';

export class SolutionStatus {
  constructor(public readonly value: SolutionStatuses) {}

  isEqualTo(to: SolutionStatus): boolean {
    return this.value === to.value;
  }
}
