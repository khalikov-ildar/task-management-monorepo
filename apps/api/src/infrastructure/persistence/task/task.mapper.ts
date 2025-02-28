import { Task as OrmTask } from '@prisma/client';
import { User } from '../../../domain/entities/user/user';
import { Task } from '../../../domain/entities/task/task';
import { TaskSummary } from '../../../domain/entities/task/task-summary';
import { Deadline } from '../../../domain/value-objects/task-deadline';
import { TaskPriority, TaskPriorities } from '../../../domain/value-objects/task-priority';
import { TaskStatus, TaskStatuses } from '../../../domain/value-objects/task-status';
import { UUID } from 'crypto';
import { UserMapper } from '../user/user.mapper';
import { TaskWithOwnerAndAssignees, GetAssignedTaskDto } from './task-orm.dtos';

export class TaskMapper {
  public static toDomain(t: TaskWithOwnerAndAssignees): Task {
    const deadline = Deadline.create(t.deadline)._unsafeUnwrap();
    const priority = new TaskPriority(t.priority as TaskPriorities);
    const status = new TaskStatus(t.status as TaskStatuses);
    const owner = UserMapper.toDomainWithoutRole(t.owner);

    const assignees: User[] = t.assignees.map((a) => UserMapper.toDomainWithoutRole(a.user));

    return Task.create(t.title, t.description, priority, deadline, status, owner, assignees, [], t.id as UUID, t.changedAt)._unsafeUnwrap();
  }

  public static toOrm(t: Task): OrmTask {
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      ownerId: t.owner.id,
      deadline: t.deadline.value,
      status: t.status.value,
      priority: t.priority.value,
      changedAt: t.changedAt,
    } satisfies OrmTask;
  }

  public static toSummary(t: GetAssignedTaskDto): TaskSummary {
    return new TaskSummary(
      t.id as UUID,
      t.title,
      t.description,
      t.priority as TaskPriorities,
      t.deadline,
      t.status as TaskStatuses,
      t.owner.id as UUID,
      t.assignees.map((a) => a.userId as UUID),
      t.changedAt,
    );
  }
}
