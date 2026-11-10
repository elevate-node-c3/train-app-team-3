import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/config";
import { configValidationSchema } from "./config/config.schema";
import { AuthModule } from "./modules/auth/auth.module";
import { RateLimitModule } from "./common/rate.limit/rate.limit.module";
import { CatalogModule } from './modules/Catalog/catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
    }),
    AuthModule,
    RateLimitModule,
    CatalogModule,
  ],
})
export class GatewayModule {}
