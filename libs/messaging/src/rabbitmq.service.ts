import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { connect, ChannelModel, ConfirmChannel } from 'amqplib';
import { EVENTS_EXCHANGE } from '@app/contracts';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;

  private async ensureConnection() {
    if (this.channel) return;

    const connection = await connect(
      process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    );

    connection.on('error', (err) =>
      this.logger.error(`RabbitMQ connection error: ${err.message}`),
    );
    connection.on('close', () => {
      this.channel = undefined;
      this.connection = undefined;
    });

    const channel = await connection.createConfirmChannel();
    await channel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: true });

    this.connection = connection;
    this.channel = channel;
  }


  async publishEvent(routingKey: string, event: unknown) {
    try {
      await this.ensureConnection();

      const message = { pattern: routingKey, data: event };

      await new Promise<void>((resolve, reject) => {
        this.channel!.publish(
          EVENTS_EXCHANGE,
          routingKey,
          Buffer.from(JSON.stringify(message)),
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
    await this.channel?.close().catch(() => {});
    await this.connection?.close().catch(() => {});
  }
}