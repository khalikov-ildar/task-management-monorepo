import { Global, Module, ShutdownSignal } from '@nestjs/common';
import { ICurrentUserProvider } from '../../../application/common/services/i-current-user.provider';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { IEventPublisher } from '../../../application/common/services/i-event-publisher';
import { ILogger } from '@app/shared';
import { ITransactionManager } from '../../../application/common/services/i-transaction.manager';
import { IUuidProvider } from '../../../application/common/services/i-uuid.provider';
import { PrismaTransactionManager } from '../../common/persistence/prisma-transaction.manager';
import { PrismaService } from '../../common/persistence/prisma.service';
import { AlsProvider } from '../../common/services/async-local-storage/als.provider';
import { CurrentUserProvider } from '../../common/services/current-user-provider/current-user.provider';
import { RmqClientInjectionToken, RmqEventPublisher } from '../../common/services/event-publisher/rmq-event-publisher';
import { PinoLogger } from '../../common/services/logger/pino-logger';
import { UuidProvider } from '../../common/services/uuid-provider/uuid.provider';
import { registerImplementation } from '../utils/register-implementation';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    PrismaService,
    AlsProvider,
    registerImplementation(ITransactionManager, PrismaTransactionManager),
    registerImplementation(ICurrentUserProvider, CurrentUserProvider),
    registerImplementation(ILogger, PinoLogger),
    registerImplementation(IUuidProvider, UuidProvider),
    {
      provide: RmqClientInjectionToken,
      useFactory: (config: ConfigService, logger: ILogger) => {
        try {
          const rmq_url = config.getOrThrow('RMQ_URL');
          const rmq_queue = config.getOrThrow('RMQ_QUEUE');
          return ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
              urls: [rmq_url],
              queue: rmq_queue,
              noAck: false,
            },
          });
        } catch (e) {
          logger.logFatal('Failed to initialize the RmqClientProxy', { context: CommonModule.name }, e);

          process.kill(process.pid, ShutdownSignal.SIGTERM);
        }
      },
      inject: [ConfigService, ILogger],
    },
    {
      provide: IEventPublisher,
      useFactory: (client: ClientProxy, als: AlsProvider) => new RmqEventPublisher(client, als),
      inject: [RmqClientInjectionToken, AlsProvider],
    },
  ],
  exports: [PrismaService, AlsProvider, ITransactionManager, ICurrentUserProvider, IEventPublisher, ILogger, IUuidProvider],
})
export class CommonModule {}
