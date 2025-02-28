import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from './mailer/mailer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inbox } from './inbox/models/inbox';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.env.worker' }),
    MailerModule.forRootAsync({
      imports: [TypeOrmModule.forFeature([Inbox])],
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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        // TODO: Use config service
        type: 'sqlite',
        database: './worker.db',
        entities: [Inbox],
        synchronize: true,
      }),
    }),
  ],
})
export class AppModule {}
