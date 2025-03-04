import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { ILogger } from '@app/shared';
import { RMQConnectionFactory } from './app/microservices/rmq.microservice';
import { NestFactoryStatic } from '@nestjs/core/nest-factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(ILogger);

  app
    .enableShutdownHooks()
    .useGlobalPipes(new ValidationPipe({ whitelist: true }))
    .useLogger(logger as any as LoggerService);

  RMQConnectionFactory.connect(app);

  try {
    await app.startAllMicroservices();
  } catch (e) {
    logger.logFatal('Failed to connect to RabbitMQ', { context: NestFactoryStatic.name }, e);
    throw e;
  }
  await app.listen(3000);
}
bootstrap();
