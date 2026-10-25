import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';
import { configValidationSchema } from './config/config.schema';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { VerificationModule } from './modules/verification/verification.module';
import { OutboxModule } from './modules/outbox/outbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
    }),

    DatabaseModule,
    UsersModule,
    AuthModule,
    VerificationModule,
    OutboxModule,
  ],
})
export class AppModule { }