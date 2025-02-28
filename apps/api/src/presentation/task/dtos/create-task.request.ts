import { ApiProperty } from '@nestjs/swagger';
import { TaskPriorities } from '../../../domain/value-objects/task-priority';
import { Type } from 'class-transformer';
import { IsString, IsIn, IsDate, ArrayUnique, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export const prioritiesList: TaskPriorities[] = ['low', 'medium', 'high'];

export class CreateTaskRequest {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: prioritiesList })
  @IsIn(prioritiesList)
  priority: TaskPriorities;

  @ApiProperty({ description: 'Deadline of the task. The given time for completion must be at least 2 hours' })
  @Type(() => Date)
  @IsDate()
  deadline: Date;

  @ApiProperty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  assigneeIds: UUID[];
}
