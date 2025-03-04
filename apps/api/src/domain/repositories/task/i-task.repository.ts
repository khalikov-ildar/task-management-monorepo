import { UUID } from 'node:crypto';
import { Task } from '../../entities/task/task';
import { TaskSummary } from '../../entities/task/task-summary';
import { Query } from '../../common/repository/query';
import { PaginatedResult } from '../../common/repository/paginated-result';

export abstract class ITaskRepository {
  abstract getById(id: UUID, tx?: any): Promise<Task | null>;
  abstract getOwned<T extends Query<Task>>(query: T, tx?: any): Promise<PaginatedResult<TaskSummary>>;
  abstract getAssigned<T extends Query<Task>>(query: T, tx?: any): Promise<PaginatedResult<TaskSummary>>;
  abstract create(task: Task, tx: any): Promise<void>;
  abstract update(task: Task, tx: any): Promise<void>;
  abstract updateStatus(task: Task, tx?: any): Promise<void>;
  abstract updatePriority(task: Task, tx?: any): Promise<void>;
  abstract delete(task: Task, tx: any): Promise<void>;
}
