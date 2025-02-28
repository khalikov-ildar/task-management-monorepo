import { Provider } from '@nestjs/common';
import { ICurrentUserProvider } from '../../../application/common/services/i-current-user.provider';
import { ILogger } from '../../../application/common/services/i-logger';
import { ITransactionManager } from '../../../application/common/services/i-transaction.manager';
import { ChangeTaskPriorityUseCase } from '../../../application/task/use-cases/change-priority/change-task-priority.use-case';
import { CreateTaskUseCase } from '../../../application/task/use-cases/create/create-task.use-case';
import { GetAssignedTasksUseCase } from '../../../application/task/use-cases/get-assigned/get-assigned-tasks.use-case';
import { GetOwnedTasksUseCase } from '../../../application/task/use-cases/get-owned/get-owned-tasks.use-case';
import { ITaskRepository } from '../../../domain/repositories/task/i-task.repository';
import { IUserRepository } from '../../../domain/repositories/user/i-user.repository';

export function registerTaskUseCases(): Provider[] {
  return [
    {
      provide: ChangeTaskPriorityUseCase,
      inject: [ICurrentUserProvider, IUserRepository, ITaskRepository, ILogger],
      useFactory: (currentUserProvider: ICurrentUserProvider, userRepo: IUserRepository, taskRepo: ITaskRepository, logger: ILogger) =>
        new ChangeTaskPriorityUseCase(currentUserProvider, userRepo, taskRepo, logger),
    },
    {
      provide: CreateTaskUseCase,
      inject: [ICurrentUserProvider, IUserRepository, ITaskRepository, ITransactionManager, ILogger],
      useFactory: (
        currentUserProvider: ICurrentUserProvider,
        userRepo: IUserRepository,
        taskRepo: ITaskRepository,
        transManager: ITransactionManager,
        logger: ILogger,
      ) => new CreateTaskUseCase(currentUserProvider, userRepo, taskRepo, transManager, logger),
    },
    {
      provide: GetAssignedTasksUseCase,
      inject: [ICurrentUserProvider, ITaskRepository, ILogger],
      useFactory: (currentUserProvider: ICurrentUserProvider, taskRepo: ITaskRepository, logger: ILogger) =>
        new GetAssignedTasksUseCase(currentUserProvider, taskRepo, logger),
    },
    {
      provide: GetOwnedTasksUseCase,
      inject: [ICurrentUserProvider, ITaskRepository, ILogger],
      useFactory: (currentUserProvider: ICurrentUserProvider, taskRepo: ITaskRepository, logger: ILogger) =>
        new GetOwnedTasksUseCase(currentUserProvider, taskRepo, logger),
    },
  ];
}
