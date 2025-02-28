import { ReviewStatuses } from '../../../../domain/value-objects/review-status';
import { UUID } from 'node:crypto';

export class ReviewTaskCommand {
  constructor(
    public readonly solutionId: UUID,
    public readonly status: ReviewStatuses,
    public readonly feedback?: string,
  ) {}
}
