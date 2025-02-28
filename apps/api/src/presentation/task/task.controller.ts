import { Body, Controller, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { CreateTaskUseCase } from '../../application/task/use-cases/create/create-task.use-case';
import { ChangeTaskPriorityUseCase } from '../../application/task/use-cases/change-priority/change-task-priority.use-case';
import { GetAssignedTasksUseCase } from '../../application/task/use-cases/get-assigned/get-assigned-tasks.use-case';
import { GetOwnedTasksUseCase } from '../../application/task/use-cases/get-owned/get-owned-tasks.use-case';
import { ResultMapperInterceptor } from '../../infrastructure/common/inteceptors/result.mapper.interceptor';
import { UUID } from 'node:crypto';
import { GetAssignedTasksQuery } from '../../application/task/use-cases/get-assigned/get-assigned-tasks.query';
import { GetOwnedTasksQuery } from '../../application/task/use-cases/get-owned/get-owned-tasks.query';
import { CreateTaskRequest } from './dtos/create-task.request';
import { CreateTaskCommand } from '../../application/task/use-cases/create/create-task.command';
import { ChangeTaskPriorityCommand } from '../../application/task/use-cases/change-priority/change-task-priority.command';
import { ChangePriorityRequest } from './dtos/change-task-priority.request';

@UseInterceptors(ResultMapperInterceptor)
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly changePriority: ChangeTaskPriorityUseCase,
    private readonly getAssigned: GetAssignedTasksUseCase,
    private readonly getOwned: GetOwnedTasksUseCase,
  ) {}

  @Get('/assigned-to/:userId')
  async getAssignedTasks(@Param('userId') userId: UUID) {
    return await this.getAssigned.execute(GetAssignedTasksQuery.create(userId, 10, 1));
  }

  @Get('/owned-by/:userId')
  async getOwnedTasks(@Param('userId') userId: UUID) {
    return await this.getOwned.execute(GetOwnedTasksQuery.create(userId, 10, 1));
  }

  @Post()
  async create(@Body() request: CreateTaskRequest) {
    return await this.createTask.execute(
      new CreateTaskCommand(request.title, request.description, request.priority, request.deadline, request.assigneeIds),
    );
  }

  @Put(':id/priority')
  async changeTaskPriority(@Body() request: ChangePriorityRequest, @Param('id') id: UUID) {
    return await this.changePriority.execute(new ChangeTaskPriorityCommand(id, request.priority));
  }
}
