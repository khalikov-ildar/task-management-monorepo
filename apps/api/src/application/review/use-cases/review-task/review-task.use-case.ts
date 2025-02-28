import { CustomError } from '../../../../domain/common/error/custom-error';
import { Review } from '../../../../domain/entities/review/review';
import { User } from '../../../../domain/entities/user/user';
import { UserErrors } from '../../../../domain/errors/user/user.errors';
import { IReviewRepository } from '../../../../domain/repositories/review/i-review.repository';
import { ISolutionRepository } from '../../../../domain/repositories/solution/i-solution.repository';
import { ITaskRepository } from '../../../../domain/repositories/task/i-task.repository';
import { IUserRepository } from '../../../../domain/repositories/user/i-user.repository';
import { ReviewStatus } from '../../../../domain/value-objects/review-status';
import { Result, err, ok } from 'neverthrow';
import { IUseCase } from '../../../common/i-use-case';
import { ICurrentUserProvider } from '../../../common/services/i-current-user.provider';
import { ITransactionManager } from '../../../common/services/i-transaction.manager';
import { ReviewTaskCommand } from './review-task.command';
import { ReviewCreatedResponse } from '../../dtos/review-created.response';
import { SolutionErrors } from '../../../../domain/errors/solution/solution-errors';
import { ILogger } from '../../../common/services/i-logger';
import { UUID } from 'node:crypto';
import { UnexpectedError } from '../../../common/errors/unexpected-error';
import { Solution } from 'apps/api/src/domain/entities/solution/solution';

export class ReviewTaskUseCase implements IUseCase<ReviewTaskCommand, ReviewCreatedResponse> {
  constructor(
    private readonly currentUserProvider: ICurrentUserProvider,
    private readonly userRepository: IUserRepository,
    private readonly solutionRepository: ISolutionRepository,
    private readonly taskRepository: ITaskRepository,
    private readonly reviewRepository: IReviewRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly logger: ILogger,
  ) {}

  async execute(request: ReviewTaskCommand): Promise<Result<ReviewCreatedResponse, CustomError>> {
    const context = ReviewTaskUseCase.name;
    const userDetails = this.currentUserProvider.getCurrentUserDetails();
    this.logger.logInfo('Attempt to create review', { context });

    const userFetchResult = await this.handleUserFetch(userDetails.userId, context);

    if (userFetchResult.isErr()) {
      return err(userFetchResult.error);
    }

    const user = userFetchResult.value;

    const solutionFetchResult = await this.handleSolutionFetch(request.solutionId, context);

    if (solutionFetchResult.isErr()) {
      return err(solutionFetchResult.error);
    }

    const solution = solutionFetchResult.value;

    const reviewStatus = new ReviewStatus(request.status);

    const reviewCreationResult = Review.create(solution, user, reviewStatus, request.feedback);

    if (reviewCreationResult.isErr()) {
      return err(reviewCreationResult.error);
    }

    const review = reviewCreationResult.value;

    const task = solution.task;

    const evaluationResult = task.evaluateCompletion(review);

    if (evaluationResult.isErr()) {
      return err(evaluationResult.error);
    }

    solution.markAsReviewed();

    try {
      await this.transactionManager.execute(async (tx) => {
        this.logger.logInfo('Starting transaction for review creation', { context, solutionId: solution.id, taskId: task.id });
        const saveSolutionChanges = this.solutionRepository.updateStatus(solution, tx);
        const saveTaskChanges = this.taskRepository.updateStatus(task, tx);
        const createReview = this.reviewRepository.create(review, tx);

        try {
          await Promise.all([saveSolutionChanges, saveTaskChanges, createReview]);
        } catch (e) {
          this.logger.logError('An error occurred while trying to save review', { context }, e);
          throw e;
        }

        this.logger.logInfo('Transaction finished successfully', { context, solutionId: solution.id, taskId: task.id });
      });
      this.logger.logInfo('Review created successfully', { context, reviewId: review.id, solutionId: solution.id, taskId: task.id });

      return ok(ReviewCreatedResponse.fromDomain(review));
    } catch (e) {
      return err(UnexpectedError.create());
    }
  }

  private async handleUserFetch(userId: UUID, context: string): Promise<Result<User, CustomError>> {
    let user: User | null;
    try {
      user = await this.userRepository.getById(userId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch user', { context }, e);
      return err(UnexpectedError.create());
    }
    if (!user) {
      return err(UserErrors.UserNotFound({ id: userId }));
    }

    return ok(user);
  }

  private async handleSolutionFetch(solutionId: UUID, context: string): Promise<Result<Solution, CustomError>> {
    let solution: Solution | null;
    try {
      solution = await this.solutionRepository.getById(solutionId);
    } catch (e) {
      this.logger.logError('An error occurred while trying to fetch solution', { context }, e);
      return err(UnexpectedError.create());
    }

    if (!solution) {
      return err(SolutionErrors.notFound(solutionId));
    }

    return ok(solution);
  }
}
