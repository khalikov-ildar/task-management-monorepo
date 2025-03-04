import { Module } from '@nestjs/common';
import { registerImplementation } from '../utils/register-implementation';
import { ITaskRepository } from '../../../domain/repositories/task/i-task.repository';
import { TaskRepository } from '../../persistence/task/task.repository';
import { registerTaskUseCases } from '../di/task-use-cases.registration';
import { TaskController } from '../../../presentation/task/task.controller';
import { UserModule } from './user.module';

@Module({
  imports: [UserModule],
  providers: [registerImplementation(ITaskRepository, TaskRepository), ...registerTaskUseCases()],
  controllers: [TaskController],
})
export class TaskModule {}
