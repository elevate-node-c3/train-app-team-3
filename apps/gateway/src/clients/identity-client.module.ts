import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'IDENTITY_PACKAGE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'identity',
            protoPath: join(process.cwd(), 'libs/contracts/src/proto/identity.proto'),
            url: config.get<string>('gateway.identityGrpcUrl', 'localhost:50051'),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class IdentityClientModule {}
