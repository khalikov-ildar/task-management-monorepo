import { ReviewStatus, ReviewStatuses } from '../../../value-objects/review-status';

export function createValidReviewStatus(status: ReviewStatuses): ReviewStatus {
  return ReviewStatus.create(status);
}
