import { ReviewStatuses } from '../../../domain/value-objects/review-status';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const reviewStatusList: ReviewStatuses[] = ['accepted', 'rejected'];

export class ReviewTaskRequest {
  @IsIn(reviewStatusList)
  reviewStatus: ReviewStatuses;

  @IsString()
  @MinLength(10)
  @MaxLength(400)
  @IsOptional()
  feedback?: string;
}
