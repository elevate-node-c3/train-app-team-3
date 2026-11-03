import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { connect, ChannelModel, ConfirmChannel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;

  private readonly exchangeName = 'app.events';
  private readonly routingKey = 'verification-code-issued';

  private async ensureConnection() {
    if (this.channel) return;

    this.connection = await connect(
      process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    );

    this.channel = await this.connection.createConfirmChannel();

    await this.channel.assertExchange(
      this.exchangeName,
      'topic',
      { durable: true },
    );
  }

  async publishEvent(payload: unknown) {
    try {
      await this.ensureConnection();

      await new Promise<void>((resolve, reject) => {
        this.channel!.publish(
          this.exchangeName,
          this.routingKey,
          Buffer.from(JSON.stringify(payload)),
          { persistent: true, contentType: 'application/json' },
          (error) => error ? reject(error) : resolve(),
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
