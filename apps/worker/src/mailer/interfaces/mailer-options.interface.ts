import { InjectionToken, ModuleMetadata } from '@nestjs/common';

export interface MailerOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  senderAddress: string;
}

export interface MailerModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => MailerOptions | Promise<MailerOptions>;
  inject?: InjectionToken[];
}
