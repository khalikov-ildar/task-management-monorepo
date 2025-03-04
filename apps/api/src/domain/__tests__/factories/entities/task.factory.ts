import { Task } from '../../../entities/task/task';
import { TaskPriorities, TaskPriority } from '../../../value-objects/task-priority';
import { TaskStatus } from '../../../value-objects/task-status';
import { createValidDeadline } from '../value-objects/deadline.factory';
import { createValidUser } from './user.factory';

export function createValidTask(priority: TaskPriorities): Task {
  const user = createValidUser('Supervisor');
  const assignees = [];
  for (let i = 0; i < Task.maxAssigneesCount; i++) {
    assignees.push(createValidUser('Member'));
  }
  return Task.create(
    'title',
    'description',
    TaskPriority.create(priority),
    createValidDeadline(),
    TaskStatus.create(),
    user,
    assignees,
  )._unsafeUnwrap();
}
