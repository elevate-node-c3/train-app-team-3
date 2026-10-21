import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GatewayModule } from './gateway.module';
import { GrpcExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(GatewayModule);

    app.setGlobalPrefix('api');
    app.useGlobalFilters(new GrpcExceptionFilter());

    const configService = app.get(ConfigService);
    const port = configService.get<number>('gateway.port', 3000);

    await app.listen(port);
    console.log(`Gateway is running on: http://localhost:${port}/api`);
}
bootstrap();