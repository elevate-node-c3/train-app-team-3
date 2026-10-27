import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'INVENTORY_PACKAGE',
                inject: [ConfigService],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: 'inventory',
                        protoPath: join(process.cwd(), 'libs/contracts/src/proto/inventory.proto'),
                        url: config.get<string>('gateway.inventoryGrpcUrl', 'localhost:50053'),
                    },
                }),
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class InventoryClientModule { }
