import { Body, Controller, Post, Query, UseInterceptors } from '@nestjs/common';
import { SubmitSolutionUseCase } from '../../application/solution/use-cases/submit/submit-solution.use-case';
import { SubmitSolutionCommand } from '../../application/solution/use-cases/submit/submit-solution.command';
import { UUID } from 'node:crypto';
import { SubmitSolutionRequest } from './dtos/submit-solution.request';
import { ResultMapperInterceptor } from '../../infrastructure/common/inteceptors/result.mapper.interceptor';

@UseInterceptors(ResultMapperInterceptor)
@Controller()
export class SolutionController {
  constructor(private readonly submitSolution: SubmitSolutionUseCase) {}

  @Post('tasks/:taskId/solutions')
  async submit(@Body() request: SubmitSolutionRequest, @Query('taskId') taskId: UUID) {
    return await this.submitSolution.execute(new SubmitSolutionCommand(taskId, request.fileId, request.additionalDetails));
  }
}
