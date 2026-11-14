import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { connect, ChannelModel, ConfirmChannel } from 'amqplib';
import { EVENTS_EXCHANGE, EVENT_QUEUES } from './event-topology';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;

  private async ensureConnection() {
    if (this.channel) return;

    this.connection = await connect(
      process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    );

    this.channel = await this.connection.createConfirmChannel();

    await this.channel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: true });

    for (const { queue, routingKeys } of EVENT_QUEUES) {
      await this.channel.assertQueue(queue, { durable: true });
      for (const key of routingKeys) {
        await this.channel.bindQueue(queue, EVENTS_EXCHANGE, key);
      }
    }
  }

  async publishEvent(routingKey: string, payload: unknown) {
    try {
      await this.ensureConnection();

      await new Promise<void>((resolve, reject) => {
        this.channel!.publish(
          EVENTS_EXCHANGE,
          routingKey,
          Buffer.from(JSON.stringify(payload)),
          { persistent: true, contentType: 'application/json' },
          (error) => (error ? reject(error) : resolve()),
        );
      });
    } catch (error) {
      await this.channel?.close().catch(() => {});
      await this.connection?.close().catch(() => {});

      this.channel = undefined;
      this.connection = undefined;

      throw error;
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}