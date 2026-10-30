import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/config";
import { configValidationSchema } from "./config/config.schema";
import { AuthModule } from "./modules/auth/auth.module";
import { RateLimitModule } from "./common/rate.limit/rate.limit.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
    }),
    AuthModule,
    RateLimitModule,
  ],
})
export class GatewayModule {}
