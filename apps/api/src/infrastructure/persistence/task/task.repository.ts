import { Injectable } from '@nestjs/common';
import { Task } from '../../../domain/entities/task/task';
import { GetAssignedTasksQuery } from '../../../application/task/use-cases/get-assigned/get-assigned-tasks.query';
import { GetOwnedTasksQuery } from '../../../application/task/use-cases/get-owned/get-owned-tasks.query';
import { PaginatedResult } from '../../../domain/common/repository/paginated-result';
import { TaskSummary } from '../../../domain/entities/task/task-summary';
import { ITaskRepository } from '../../../domain/repositories/task/i-task.repository';
import { TaskStatuses } from '../../../domain/value-objects/task-status';
import { UUID } from 'node:crypto';
import { PrismaService } from '../../common/persistence/prisma.service';
import { TaskMapper } from './task.mapper';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: UUID, tx?: any): Promise<Task | null> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ormTask = await prismaTx.task.findUnique({
      where: { id },
      include: { assignees: { include: { user: true } }, owner: true },
    });
    if (!ormTask) {
      return null;
    }

    return TaskMapper.toDomain(ormTask);
  }

  async getOwned(query: GetOwnedTasksQuery, tx?: any): Promise<PaginatedResult<TaskSummary>> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const ownerId = query.filterBy.owner;

    const { pageSize, pageNumber, sortBy, sortAscending } = query;
    const orderBy = this.createOrderByObject(sortAscending, sortBy);
    const skip = (pageNumber - 1) * pageSize;

    const tasks = await prismaTx.task.findMany({
      where: {
        ownerId,
        status: {
          not: {
            equals: 'approved' satisfies TaskStatuses,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        deadline: true,
        status: true,
        changedAt: true,
        owner: { select: { id: true } },
        assignees: { select: { userId: true } },
      },
      orderBy,
      skip,
      take: pageSize,
    });

    if (tasks.length === 0) {
      return new PaginatedResult<TaskSummary>(0, pageNumber, pageSize, []);
    }

    const totalCount = await prismaTx.task.count({
      where: {
        ownerId,
      },
    });

    const taskSummaries = tasks.map(TaskMapper.toSummary);
    return new PaginatedResult<TaskSummary>(totalCount, pageNumber, pageSize, taskSummaries);
  }

  async getAssigned(query: GetAssignedTasksQuery, tx?: any): Promise<PaginatedResult<TaskSummary>> {
    const prismaTx = (tx as PrismaService) || this.prisma;
    const assigneeId = query.filterBy.assignees;

    const { pageSize, pageNumber, sortBy, sortAscending } = query;
    const orderBy = this.createOrderByObject(sortAscending, sortBy);
    const skip = (pageNumber - 1) * pageSize;

    const tasks = await prismaTx.task.findMany({
      where: {
        status: 'pending' satisfies TaskStatuses,
        assignees: {
          some: {
            userId: assigneeId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        deadline: true,
        status: true,
        changedAt: true,
        owner: { select: { id: true } },
        assignees: { select: { userId: true } },
      },
      orderBy,
      skip,
      take: pageSize,
    });

    if (tasks.length === 0) {
      return new PaginatedResult<TaskSummary>(0, pageNumber, pageSize, []);
    }

    const totalCount = await prismaTx.task.count({
      where: {
        assignees: {
          some: {
            userId: assigneeId,
          },
        },
      },
    });

    const taskSummaries = tasks.map(TaskMapper.toSummary);
    return new PaginatedResult<TaskSummary>(totalCount, pageNumber, pageSize, taskSummaries);
  }

  async create(task: Task, tx: PrismaService): Promise<void> {
    const mappedTask = TaskMapper.toOrm(task);
    await tx.task.create({ data: mappedTask });
    const assignments = task.assignees.map((a) => ({
      userId: a.id,
      taskId: mappedTask.id,
    }));
    await tx.userTaskAssignment.createMany({ data: assignments });
  }

  async update(task: Task, tx: PrismaService): Promise<void> {
    const taskId = task.id;
    const mappedTask = TaskMapper.toOrm(task);

    await tx.task.update({
      where: { id: taskId },
      data: mappedTask,
    });

    await tx.userTaskAssignment.deleteMany({ where: { taskId } });

    if (task.assignees.length > 0) {
      await tx.userTaskAssignment.createMany({
        data: task.assignees.map((assignee) => ({
          taskId,
          userId: assignee.id,
        })),
      });
    }
  }

  async updateStatus(task: Task, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;

    await prismaTx.task.update({ data: { status: task.status.value, changedAt: task.changedAt }, where: { id: task.id } });
  }

  async updatePriority(task: Task, tx?: any): Promise<void> {
    const prismaTx = (tx as PrismaService) || this.prisma;

    await prismaTx.task.update({ data: { priority: task.priority.value, changedAt: task.changedAt }, where: { id: task.id } });
  }

  async delete(task: Task, tx?: PrismaService): Promise<void> {
    const deleteTask = tx.task.delete({ where: { id: task.id } });
    const deleteJointTask = tx.userTaskAssignment.deleteMany({ where: { taskId: task.id } });

    await Promise.all([deleteTask, deleteJointTask]);
  }

  private createOrderByObject(sortAscending: boolean, sortBy?: string): Record<string, string> | undefined {
    let orderBy = undefined;

    if (sortBy) {
      orderBy = { [sortBy]: sortAscending ? 'asc' : 'desc' };
    }
    return orderBy;
  }
}
