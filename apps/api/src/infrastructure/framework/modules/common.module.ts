import { Global, Module } from '@nestjs/common';
import { ICurrentUserProvider } from '../../../application/common/services/i-current-user.provider';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { IEventPublisher } from '../../../application/common/services/i-event-publisher';
import { ILogger } from '../../../application/common/services/i-logger';
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
      useFactory: (config: ConfigService) => {
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
          console.error('FATAL: Error creating RMQ client.  Application cannot start.', e);

          process.exit(1);
        }
      },
      inject: [ConfigService],
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
