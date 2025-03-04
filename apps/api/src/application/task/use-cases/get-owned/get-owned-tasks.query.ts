import { Query } from '../../../../domain/common/repository/query';
import { Task } from '../../../../domain/entities/task/task';
import { UUID } from 'crypto';

export class GetOwnedTasksQuery extends Query<Task> {
  private constructor(
    pageSize: number,
    pageNumber: number,
    public readonly ownerId: UUID,
  ) {
    super(pageSize, pageNumber);
  }
}
