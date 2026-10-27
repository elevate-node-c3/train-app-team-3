import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'NOTIFICATION_PACKAGE',
                inject: [ConfigService],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: 'notification',
                        protoPath: join(process.cwd(), 'libs/contracts/src/proto/notification.proto'),
                        url: config.get<string>('gateway.notificationGrpcUrl', 'localhost:50056'),
                    },
                }),
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class NotificationClientModule { }
