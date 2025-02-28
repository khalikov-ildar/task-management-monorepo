import { Filter, Query } from '../../../../domain/common/repository/query';
import { Task } from '../../../../domain/entities/task/task';
import { UUID } from 'node:crypto';

export class GetAssignedTasksQuery extends Query<Task, 'assignees'> {
  private constructor(
    pageSize: number,
    pageNumber: number,
    filterBy: Filter<Task, 'assignees'>,
    sortBy?: keyof Task,
    sortAscending?: boolean,
  ) {
    super(pageSize, pageNumber, filterBy, sortBy, sortAscending);
  }

  public static create(
    userId: UUID,
    pageSize?: number,
    pageNumber?: number,
    sortBy?: keyof Task,
    sortAscending?: boolean,
  ): GetAssignedTasksQuery {
    let validatedPageSize: number;

    if (!pageSize || pageSize > 20) {
      validatedPageSize = 10;
    }

    return new GetAssignedTasksQuery(validatedPageSize, pageNumber, { assignees: userId }, sortBy, sortAscending);
  }
}
