import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { NOTIFICATION_EVENTS_QUEUE } from "../../../libs/contracts/src/events.interfaces/verification-code-issued.event";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
        queue: NOTIFICATION_EVENTS_QUEUE,
        queueOptions: { durable: true },
        noAck: false,
        prefetchCount: 10,
      },
    },
  );

  await app.listen();
}

void bootstrap();