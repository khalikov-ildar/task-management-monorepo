import { ApiProperty } from '@nestjs/swagger';
import { TaskPriorities } from 'apps/api/src/domain/value-objects/task-priority';
import { IsIn } from 'class-validator';
import { prioritiesList } from './create-task.request';

export class ChangePriorityRequest {
  @ApiProperty({ description: 'New desired task priority', enum: prioritiesList })
  @IsIn(prioritiesList)
  priority: TaskPriorities;
}
