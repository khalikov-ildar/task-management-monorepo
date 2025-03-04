import { Review } from '../../../entities/review/review';
import { ReviewStatuses } from '../../../value-objects/review-status';
import { createValidReviewStatus } from '../value-objects/review-status.factory';
import { createValidSolution } from './solution.factory';
import { createValidUser } from './user.factory';

export function createValidReview(status: ReviewStatuses): Review {
  const solution = createValidSolution();
  const user = createValidUser('Supervisor');
  const reviewStatus = createValidReviewStatus(status);
  return Review.create(solution, user, reviewStatus)._unsafeUnwrap();
}
