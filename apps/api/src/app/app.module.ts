import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../infrastructure/framework/modules/common.module';
import { Request } from 'express';
import { AlsProvider } from '../infrastructure/common/services/async-local-storage/als.provider';
import { AlsStructure } from '../infrastructure/common/services/async-local-storage/als-store.type';
import { randomUUID } from 'node:crypto';
import { maskIP } from '../presentation/common/utils/mask-ip';
import { UserModule } from '../infrastructure/framework/modules/user.module';
import { AuthModule } from '../infrastructure/framework/modules/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { TaskModule } from '../infrastructure/framework/modules/task.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLatencyLoggerInterceptor } from '../infrastructure/common/inteceptors/request-latency-logger.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.env.api' }),
    CacheModule.register({ isGlobal: true }),
    CommonModule,
    UserModule,
    AuthModule,
    TaskModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: RequestLatencyLoggerInterceptor }],
})
export class AppModule implements NestModule {
  constructor(private readonly als: AlsProvider) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res, next) => {
        const store = new Map<keyof AlsStructure, AlsStructure[keyof AlsStructure]>();
        const traceId = (req.headers['x-request-id'] as string) || randomUUID();
        const ip = maskIP(req.ip);
        store.set('traceId', traceId).set('maskedIp', ip).set('path', req.originalUrl);
        this.als.run(store, () => {
          return next();
        });
      })
      .forRoutes('*');
  }
}
