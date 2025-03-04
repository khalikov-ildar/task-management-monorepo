export type ReviewStatuses = 'accepted' | 'rejected';

const reviewStatusList: ReviewStatuses[] = ['accepted', 'rejected'];
export class ReviewStatus {
  private constructor(public readonly value: ReviewStatuses) {}

  public static create(value: ReviewStatuses) {
    if (!reviewStatusList.includes(value)) {
      throw new Error('The invalid value passed into review status: ' + value);
    }

    return new ReviewStatus(value);
  }

  isEqualTo(to: ReviewStatus): boolean {
    return this.value === to.value;
  }
}
