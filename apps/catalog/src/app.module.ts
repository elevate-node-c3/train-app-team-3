import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import catalogConfig from './config/config';
import { configValidationSchema } from './config/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [catalogConfig],
      validationSchema: configValidationSchema,
    }),
    DatabaseModule,
  ],
})
export class AppModule { }