import { UUID } from 'node:crypto';

export class SubmitSolutionCommand {
  constructor(
    public readonly taskId: UUID,
    public readonly fileId: UUID,
    public readonly additionalDetails?: string,
  ) {}
}
