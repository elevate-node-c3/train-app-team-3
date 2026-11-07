import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/config";
import { configValidationSchema } from "./config/config.schema";
import { AuthModule } from "./modules/auth/auth.module";
import { RateLimitModule } from "./common/rate.limit/rate.limit.module";
import { GatewayI18nModule } from "./i18n/i18n.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/gateway/.env",
      load: [configuration],
      validationSchema: configValidationSchema,
    }),
    GatewayI18nModule,
    AuthModule,
    RateLimitModule,
  ],
})
export class GatewayModule {}
