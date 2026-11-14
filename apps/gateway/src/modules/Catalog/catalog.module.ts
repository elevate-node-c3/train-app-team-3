
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CATALOG_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'catalog',
          protoPath: join(process.cwd(), 'libs/contracts/src/proto/catalog.proto'),
          url: 'localhost:5000',
        },
      },
    ]),
  ],
  controllers: [CatalogController],
})
export class CatalogModule {}
