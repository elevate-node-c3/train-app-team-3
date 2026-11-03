
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';
import { AuthModule } from './modules/auth/auth.module';
import { configValidationSchema } from './config/config.schema';
import { CatalogModule } from './modules/Catalog/catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
    }),
    AuthModule,
    CatalogModule,
  ],
})
export class GatewayModule {}
