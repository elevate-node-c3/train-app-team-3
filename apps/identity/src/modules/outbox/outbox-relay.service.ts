
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { connect, ChannelModel, ConfirmChannel } from 'amqplib';
import { decryptPayload , OutboxEvent } from './ outbox.entity';

decryptPayload
@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outbox: Repository<OutboxEvent>,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.sendPending(), 1000);
    void this.sendPending();
  }

  private async ensureConnection() {
    if (this.channel) return;

    this.connection = await connect(
      process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    );

    this.channel = await this.connection.createConfirmChannel();
    await this.channel.assertExchange('app.events', 'topic', { durable: true });
  }

  private async publish(payload: unknown) {
    await this.ensureConnection();

    await new Promise<void>((resolve, reject) => {
      this.channel!.publish(
        'app.events',
        'verification-code-issued',
        Buffer.from(JSON.stringify(payload)),
        { persistent: true, contentType: 'application/json' },
        (error) => error ? reject(error) : resolve(),
      );
    });
  }

  private async sendPending() {
    if (this.running) return;
    this.running = true;

    try {
      const events = await this.outbox.find({
        where: { sentAt: IsNull() },
        order: { createdAt: 'ASC' },
        take: 20,
      });

      for (const event of events) {
        await this.publish(decryptPayload(event.payload));
        await this.outbox.update(
          { eventId: event.eventId },
          { sentAt: new Date() },
        );
      }
    } catch {
      await this.channel?.close().catch(() => {});
      await this.connection?.close().catch(() => {});
      this.channel = undefined;
      this.connection = undefined;
    } finally {
      this.running = false;
    }
  }

  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.channel?.close();
    await this.connection?.close();
  }
}
