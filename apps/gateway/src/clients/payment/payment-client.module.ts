import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'PAYMENT_PACKAGE',
                inject: [ConfigService],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: 'payment',
                        protoPath: join(process.cwd(), 'libs/contracts/src/proto/payment.proto'),
                        url: config.get<string>('gateway.paymentGrpcUrl', 'localhost:50055'),
                    },
                }),
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class PaymentClientModule { }
