import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(AppModule);
    const configService = appContext.get(ConfigService);

    const port = configService.get<number>('identity.port', 50051);
    await appContext.close();

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            package: 'identity',
            protoPath: join(process.cwd(), 'libs/contracts/src/proto/identity.proto'),
            url: `0.0.0.0:${port}`,
        },
    });

    await app.listen();
    console.log(`Identity gRPC service is running on port: ${port}`);
}

bootstrap();