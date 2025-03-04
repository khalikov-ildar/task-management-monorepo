import { Body, Controller, Post, Query, UseInterceptors } from '@nestjs/common';
import { ReviewTaskUseCase } from '../../application/review/use-cases/review-task/review-task.use-case';
import { ResultMapperInterceptor } from '../../infrastructure/common/inteceptors/result.mapper.interceptor';
import { UUID } from 'node:crypto';
import { ReviewTaskCommand } from '../../application/review/use-cases/review-task/review-task.command';
import { ReviewTaskRequest } from './dtos/review-task.request';

@UseInterceptors(ResultMapperInterceptor)
@Controller()
export class ReviewController {
  constructor(private readonly reviewTask: ReviewTaskUseCase) {}

  @Post('tasks/:taskId/solutions/:solutionId/reviews')
  async review(@Body() request: ReviewTaskRequest, @Query('taskId') taskId: UUID, @Query('solutionId') solutionId: UUID) {
    return await this.reviewTask.execute(new ReviewTaskCommand(solutionId, request.reviewStatus, request.feedback));
  }
}
