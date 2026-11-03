import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, RpcException, Transport } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const port = process.env.IDENTITY_GRPC_PORT ?? '50051';

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            package: 'identity',
            protoPath: join(process.cwd(), 'libs/contracts/src/proto/identity.proto'),
            url: `0.0.0.0:${port}`,
        },
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory: (errors) =>
                new RpcException({
                    code: status.INVALID_ARGUMENT,
                    message: errors.flatMap((e) => Object.values(e.constraints ?? {})).join(', '),
                }),
        }),
    );

    await app.listen();
    console.log(`Identity gRPC service is running on port: ${port}`);
}

bootstrap();