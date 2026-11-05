import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect } from 'amqplib';
import {
  EVENTS_EXCHANGE,
  NOTIFICATION_DLQ,
  NOTIFICATION_DLX,
  NOTIFICATION_QUEUE,
  NOTIFICATION_QUEUE_ARGUMENTS,
  NOTIFICATION_RETRY_DELAYS_MS,
  notificationRetryQueue,
  ROUTING_KEYS,
} from '@app/contracts';

@Injectable()
export class RabbitMQTopologyService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQTopologyService.name);

  async onModuleInit() {
    const connection = await connect(
      process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    );

    try {
      const channel = await connection.createChannel();
      const routingKey = ROUTING_KEYS.VERIFICATION_CODE_ISSUED;

      await channel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: true });
      await channel.assertExchange(NOTIFICATION_DLX, 'direct', { durable: true });

      await channel.assertQueue(NOTIFICATION_DLQ, { durable: true });
      await channel.bindQueue(NOTIFICATION_DLQ, NOTIFICATION_DLX, routingKey);

      await channel.assertQueue(NOTIFICATION_QUEUE, {
        durable: true,
        arguments: NOTIFICATION_QUEUE_ARGUMENTS,
      });
      await channel.bindQueue(NOTIFICATION_QUEUE, EVENTS_EXCHANGE, routingKey);

      for (const delay of NOTIFICATION_RETRY_DELAYS_MS) {
        await channel.assertQueue(notificationRetryQueue(delay), {
          durable: true,
          arguments: {
            'x-message-ttl': delay,
            'x-dead-letter-exchange': '',
            'x-dead-letter-routing-key': NOTIFICATION_QUEUE,
          },
        });
      }

      await channel.close();
      this.logger.log('RabbitMQ topology asserted');
    } finally {
      await connection.close();
    }
  }
}