import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MailerModuleOptions, MailerOptions } from './interfaces/mailer-options.interface';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';

@Module({})
export class MailerModule {
  public static forRootAsync(options: MailerModuleOptions): DynamicModule {
    const mailerOptionsProvider: Provider = {
      provide: 'MAILER_OPTIONS',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: MailerModule,
      imports: options.imports || [],
      providers: [
        mailerOptionsProvider,
        {
          provide: MailerService,
          useFactory: (mailerOptions: MailerOptions) => new MailerService(mailerOptions),
          inject: ['MAILER_OPTIONS'],
        },
      ],
      exports: [MailerService],
      controllers: [MailerController],
    };
  }
}
