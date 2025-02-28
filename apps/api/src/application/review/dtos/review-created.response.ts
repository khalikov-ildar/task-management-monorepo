import { Review } from '../../../domain/entities/review/review';
import { ReviewStatuses } from '../../../domain/value-objects/review-status';
import { UUID } from 'node:crypto';

export class ReviewCreatedResponse {
  private constructor(
    public readonly id: UUID,
    public readonly solutionId: UUID,
    public readonly reviewerId: UUID,
    public readonly reviewStatus: ReviewStatuses,
    public readonly createdAt: Date,
    public readonly feedback?: string,
  ) {}

  public static fromDomain(review: Review): ReviewCreatedResponse {
    return new ReviewCreatedResponse(
      review.id,
      review.solution.id,
      review.reviewer.id,
      review.status.value,
      review.createdAt,
      review.feedback,
    );
  }
}
