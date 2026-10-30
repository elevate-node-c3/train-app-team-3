import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'CATALOG_PACKAGE',
                inject: [ConfigService],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.GRPC,
                    options: {
                        package: 'catalog',
                        protoPath: join(process.cwd(), 'libs/contracts/src/proto/catalog.proto'),
                        url: config.get<string>('gateway.catalogGrpcUrl', 'localhost:50052'),
                    },
                }),
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class CatalogClientModule { }
