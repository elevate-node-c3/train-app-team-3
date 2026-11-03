
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, ConfirmChannel, ChannelModel, ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection!: ChannelModel;
  private channel!: ConfirmChannel;

  async onModuleInit() {
    this.connection = await connect(
      process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    );

    this.channel = await this.connection.createConfirmChannel();

    await this.channel.assertExchange('app.events', 'topic', { durable: true });
    await this.channel.assertExchange('app.events.retry', 'direct', { durable: true });
    await this.channel.assertExchange('app.events.dlx', 'direct', { durable: true });

    await this.channel.assertQueue('notification.dlq', { durable: true });
    await this.channel.bindQueue(
      'notification.dlq',
      'app.events.dlx',
      'verification-code-issued',
    );

    await this.channel.assertQueue('notification.verification-code-issued', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'app.events.dlx',
        'x-dead-letter-routing-key': 'verification-code-issued',
      },
    });

    await this.channel.bindQueue(
      'notification.verification-code-issued',
      'app.events',
      'verification-code-issued',
    );

    for (const delay of [5000, 10000, 20000]) {
      const queue = `notification.retry.${delay}`;

      await this.channel.assertQueue(queue, {
        durable: true,
        arguments: {
          'x-message-ttl': delay,
          'x-dead-letter-exchange': 'app.events',
          'x-dead-letter-routing-key': 'verification-code-issued',
        },
      });

      await this.channel.bindQueue(queue, 'app.events.retry', String(delay));
    }

    await this.channel.prefetch(1);
  }

  async publish(
    exchange: string,
    routingKey: string,
    data: unknown,
    headers: Record<string, unknown> = {},
  ): Promise<void> {
    await this.publishRaw(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(data)),
      headers,
    );
  }

  async publishRaw(
    exchange: string,
    routingKey: string,
    content: Buffer,
    headers: Record<string, unknown> = {},
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.channel.publish(
        exchange,
        routingKey,
        content,
        {
          persistent: true,
          contentType: 'application/json',
          headers,
        },
        (error: Error | null) => {
          if (error) reject(error);
          else resolve();
        },
      );
    });
  }

  async consume(
    queue: string,
    handler: (
      message: ConsumeMessage,
      channel: ConfirmChannel,
    ) => Promise<void>,
  ): Promise<void> {
    await this.channel.consume(
      queue,
      (message) => {
        if (!message) return;

        void handler(message, this.channel).catch(() => {
          this.channel.nack(message, false, true);
        });
      },
      { noAck: false },
    );
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
