import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GatewayModule } from './gateway.module';
import { GrpcExceptionFilter } from './common/filters/grpc-exception.filter';
import { createApiValidationPipe } from './common/utils/validation.pipe';
import { EnvelopeInterceptor } from './common/interceptors/envelope.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(createApiValidationPipe());
  app.useGlobalFilters(new GrpcExceptionFilter());
  app.useGlobalInterceptors(new EnvelopeInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('gateway.port', 3000);

  await app.listen(port);
  console.log(`Gateway is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
