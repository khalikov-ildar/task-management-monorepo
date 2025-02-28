import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';

export class RMQConnectionFactory {
  public static connect(app: INestApplication): void {
    const config = app.get(ConfigService);

    const rmq_queue = config.getOrThrow('RMQ_QUEUE');
    const rmq_url = config.getOrThrow('RMQ_URL');

    app.connectMicroservice<RmqOptions>({ transport: Transport.RMQ, options: { queue: rmq_queue, noAck: false, urls: [rmq_url] } });
  }
}
