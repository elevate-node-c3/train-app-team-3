import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import gatewayConfig from './config/config';
import { configValidationSchema } from './config/config.schema';
import { AuthModule } from './modules/auth/auth.module';
import { ContextMiddleware } from './common/utils/context.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gatewayConfig],
      validationSchema: configValidationSchema,
    }),
    AuthModule,
  ],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}
