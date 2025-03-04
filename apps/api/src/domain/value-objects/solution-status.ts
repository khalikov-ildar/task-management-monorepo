export type SolutionStatuses = 'pending' | 'reviewed';

const solutionStatusList: SolutionStatuses[] = ['pending', 'reviewed'];

export class SolutionStatus {
  private constructor(public readonly value: SolutionStatuses) {}

  public static create(value: SolutionStatuses) {
    if (!solutionStatusList.includes(value)) {
      throw new Error('The invalid value is passed into review status: ' + value);
    }

    return new SolutionStatus(value);
  }

  isEqualTo(to: SolutionStatus): boolean {
    return this.value === to.value;
  }
}
