import { Review } from '../../entities/review/review';

export abstract class IReviewRepository {
  abstract create(review: Review, tx?: any): Promise<void>;
}
