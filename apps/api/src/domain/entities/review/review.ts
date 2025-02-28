import { randomUUID, UUID } from 'node:crypto';
import { Solution } from '../solution/solution';
import { User } from '../user/user';
import { ReviewStatus } from '../../value-objects/review-status';
import { err, ok, Result } from 'neverthrow';
import { UserRoles } from '../user/user-roles';
import { CustomError } from '../../common/error/custom-error';
import { ReviewErrors } from '../../errors/review/review-errors';

export class Review {
  public readonly id: UUID;
  public readonly feedback?: string;
  public readonly createdAt: Date;

  private constructor(
    public readonly solution: Solution,
    public readonly reviewer: User,
    public readonly status: ReviewStatus,
    feedback?: string,
    createdAt?: Date,
    id?: UUID,
  ) {
    this.feedback = feedback ?? undefined;
    this.createdAt = createdAt ?? new Date();
    this.id = id ?? randomUUID();
  }

  public static create(
    solution: Solution,
    reviewer: User,
    status: ReviewStatus,
    feedback?: string,
    createdAt?: Date,
    id?: UUID,
  ): Result<Review, CustomError> {
    if (reviewer.role.name === UserRoles.Member) {
      return err(ReviewErrors.reviewCannotBeCreatedByMember());
    }

    return ok(new Review(solution, reviewer, status, feedback, createdAt, id));
  }
}
