import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from './mailer/mailer.module';
import { LoggerModule } from './logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inbox } from './inbox/inbox';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.env.worker' }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      entities: [Inbox],
      synchronize: true,
      database: 'worker.db',
    }),
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        auth: {
          user: config.getOrThrow('MAILER_USER'),
          pass: config.getOrThrow('MAILER_PASS'),
        },
        host: config.getOrThrow('MAILER_HOST'),
        port: config.getOrThrow('MAILER_PORT'),
        secure: config.getOrThrow('MAILER_SECURE'),
        senderAddress: config.getOrThrow('MAILER_SENDER_ADDRESS'),
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
  ],
})
export class AppModule {}
