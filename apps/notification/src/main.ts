import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NOTIFICATION_QUEUE, NOTIFICATION_QUEUE_ARGUMENTS } from '@app/contracts';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: NOTIFICATION_QUEUE,
      noAck: false,
      prefetchCount: 10,
      persistent: true,
      queueOptions: {
        durable: true,
        arguments: NOTIFICATION_QUEUE_ARGUMENTS,
      },
    },
  });

  await app.listen();
}
void bootstrap();