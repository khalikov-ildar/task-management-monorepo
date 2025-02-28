import { Solution } from '../../../domain/entities/solution/solution';
import { UUID } from 'node:crypto';

export class SolutionCreatedResponse {
  private constructor(
    public readonly id: UUID,
    public readonly taskId: UUID,
    public readonly fileId: UUID,
    public readonly creatorId: UUID,
    public readonly createdAt: Date,
    public readonly additionalDetails?: string,
  ) {}

  public static fromDomain(solution: Solution): SolutionCreatedResponse {
    return new SolutionCreatedResponse(
      solution.id,
      solution.task.id,
      solution.file.id,
      solution.creatorId,
      solution.createdAt,
      solution.additionalDetails,
    );
  }
}
