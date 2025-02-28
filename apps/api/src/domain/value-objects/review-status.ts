export type ReviewStatuses = 'accepted' | 'rejected';

export class ReviewStatus {
  constructor(public readonly value: ReviewStatuses) {}

  isEqualTo(to: ReviewStatus): boolean {
    return this.value === to.value;
  }
}
