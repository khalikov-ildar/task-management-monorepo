import { ILogger } from '@app/shared';
import { Global, Module } from '@nestjs/common';
import { PinoLogger } from './pino-logger';

@Global()
@Module({
  providers: [{ provide: ILogger, useClass: PinoLogger }],
  exports: [ILogger],
})
export class LoggerModule {}
