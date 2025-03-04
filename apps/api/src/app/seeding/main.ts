import { NestFactory } from '@nestjs/core';
import { SeedingModule } from './seeding.module';
import { ILogger } from '@app/shared';
import { LoggerService } from '@nestjs/common';
import { SeedingService } from './seeding.service';

async function bootstrap() {
  const app = await NestFactory.create(SeedingModule, { bufferLogs: true });
  const logger = app.get(ILogger);

  app.enableShutdownHooks().useLogger(logger as any as LoggerService);

  const seedingService = app.get(SeedingService);

  const roles = await seedingService.seedRoles();

  await seedingService.seedUsers(roles);

  await app.close();
}
bootstrap();
