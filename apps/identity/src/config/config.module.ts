import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { configValidationSchema } from "./config.schema";
import configuration from "./config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
    }),
  ],
})
export class AppConfigModule {}
