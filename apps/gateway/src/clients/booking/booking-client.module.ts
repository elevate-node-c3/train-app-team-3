import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'BOOKING_PACKAGE',
                inject: [ConfigService],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: 'booking',
                        protoPath: join(process.cwd(), 'libs/contracts/src/proto/booking.proto'),
                        url: config.get<string>('gateway.bookingGrpcUrl', 'localhost:50054'),
                    },
                }),
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class BookingClientModule { }
