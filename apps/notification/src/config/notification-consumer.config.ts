import { RmqOptions, Transport } from '@nestjs/microservices';

export const notificationRmqConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: 'notification.verification-code.queue',
    noAck: false,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'notification.dlx',
        'x-dead-letter-routing-key': 'notification.dlq',
      },
    },
  },
};