import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

export interface MessagingOptions {
    url: string;
    queue: string;
}

@Module({})
export class MessagingModule {
    static register(options: MessagingOptions): DynamicModule {
        return {
            module: MessagingModule,
            imports: [
                ClientsModule.register([
                    {
                        name: 'RABBITMQ_CLIENT',
                        transport: Transport.RMQ,
                        options: {
                            urls: [options.url],
                            queue: options.queue,
                            queueOptions: { durable: true },
                        },
                    },
                ]),
            ],
            exports: [ClientsModule],
        };
    }
}