import { Filter, Query } from '../../../../domain/common/repository/query';
import { Task } from '../../../../domain/entities/task/task';
import { UUID } from 'crypto';

export class GetOwnedTasksQuery extends Query<Task, 'owner'> {
  private constructor(
    pageSize: number,
    pageNumber: number,
    filterBy: Filter<Task, 'owner'>,
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
  ): GetOwnedTasksQuery {
    let validatedPageSize: number;

    if (!pageSize || pageSize > 20) {
      validatedPageSize = 10;
    }

    return new GetOwnedTasksQuery(validatedPageSize, pageNumber, { owner: userId }, sortBy, sortAscending);
  }
}
