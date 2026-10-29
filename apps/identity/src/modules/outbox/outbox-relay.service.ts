import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { connect, ChannelModel, ConfirmChannel } from 'amqplib';
import { OutboxEvent } from './entities/outbox-event.entity';

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(OutboxRelayService.name);
    private connection?: ChannelModel;
    private channel?: ConfirmChannel;
    private timer?: NodeJS.Timeout;
    private isRunning = false;
    private readonly rabbitUrl: string;

    constructor(
        @InjectRepository(OutboxEvent)
        private readonly outboxRepo: Repository<OutboxEvent>,
        private readonly configService: ConfigService,
    ) {
        this.rabbitUrl = this.configService.get<string>(
            'identity.rabbitmq.url',
            'amqp://guest:guest@localhost:5672',
        );
    }

    onModuleInit() {
        this.timer = setInterval(() => void this.relayPendingEvents(), 2000);
        setTimeout(() => void this.relayPendingEvents(), 1000);
    }

    private async ensureChannel(): Promise<ConfirmChannel | null> {
        if (this.channel) return this.channel;

        try {
            this.connection = await connect(this.rabbitUrl);
            this.channel = await this.connection.createConfirmChannel();
            await this.channel.assertExchange('enr.events', 'topic', { durable: true });
            return this.channel;
        } catch (err: any) {
            this.logger.warn(`Could not connect to RabbitMQ for outbox relay: ${err.message}`);
            this.channel = undefined;
            this.connection = undefined;
            return null;
        }
    }

    async relayPendingEvents() {
        if (this.isRunning) return;
        this.isRunning = true;

        try {
            const pendingEvents = await this.outboxRepo.find({
                where: { status: 'PENDING' },
                order: { createdAt: 'ASC' },
                take: 50,
            });

            if (pendingEvents.length === 0) {
                return;
            }

            const channel = await this.ensureChannel();
            if (!channel) {
                return;
            }

            for (const event of pendingEvents) {
                const routingKey = event.eventType;
                const messageBuffer = Buffer.from(JSON.stringify(event.payload));

                await new Promise<void>((resolve, reject) => {
                    channel.publish(
                        'enr.events',
                        routingKey,
                        messageBuffer,
                        {
                            persistent: true,
                            contentType: 'application/json',
                            messageId: event.eventId,
                            correlationId: event.correlationId,
                        },
                        (err) => {
                            if (err) return reject(err);
                            resolve();
                        },
                    );
                });

                event.status = 'PUBLISHED';
                event.sentAt = new Date();
                await this.outboxRepo.save(event);
            }
        } catch (err: any) {
            this.logger.warn(`Error relaying outbox events: ${err.message}`);
            await this.channel?.close().catch(() => { });
            await this.connection?.close().catch(() => { });
            this.channel = undefined;
            this.connection = undefined;
        } finally {
            this.isRunning = false;
        }
    }

    async onModuleDestroy() {
        if (this.timer) clearInterval(this.timer);
        try {
            await this.channel?.close();
            await this.connection?.close();
        } catch {
            // ignore shutdown errors
        }
    }
}
