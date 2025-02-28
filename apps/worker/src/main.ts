import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const rmq_queue = config.getOrThrow('RMQ_QUEUE');
  const rmq_url = config.getOrThrow('RMQ_URL');

  app.connectMicroservice<RmqOptions>({ transport: Transport.RMQ, options: { queue: rmq_queue, noAck: false, urls: [rmq_url] } });

  await app.startAllMicroservices();

  await app.init();
}
bootstrap();
