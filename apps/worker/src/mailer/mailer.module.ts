import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MailerModuleOptions, MailerOptions } from './interfaces/mailer-options.interface';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { MailerProcessor } from './mailer.processor';

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
        MailerProcessor,
      ],
      exports: [MailerService, MailerProcessor],
      controllers: [MailerController],
    };
  }
}
