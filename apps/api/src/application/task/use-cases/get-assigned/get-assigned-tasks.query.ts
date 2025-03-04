import { Query } from '../../../../domain/common/repository/query';
import { Task } from '../../../../domain/entities/task/task';
import { UUID } from 'node:crypto';

export class GetAssignedTasksQuery extends Query<Task> {
  private constructor(
    pageSize: number,
    pageNumber: number,
    public readonly assigneeId: UUID,
  ) {
    super(pageSize, pageNumber);
  }
}
