import { randomUUID, UUID } from 'node:crypto';
import { SolutionStatus } from '../../value-objects/solution-status';
import { File } from '../file/file';
import { Task } from '../task/task';

export class Solution {
  public readonly id: UUID;
  public status: SolutionStatus;
  public additionalDetails?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    public readonly task: Task,
    public readonly file: File,
    public readonly creatorId: UUID,
    additionalDetails?: string,
    status?: SolutionStatus,
    createdAt?: Date,
    updatedAt?: Date,
    id?: UUID,
  ) {
    this.status = status ?? new SolutionStatus('pending');
    this.additionalDetails = additionalDetails ?? undefined;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
    this.id = id ?? randomUUID();
  }

  markAsReviewed(): void {
    this.status = new SolutionStatus('reviewed');
    this.updatedAt = new Date();
  }
}
