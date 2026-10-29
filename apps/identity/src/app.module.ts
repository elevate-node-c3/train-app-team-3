import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@app/cache';
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

    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('identity.redis.host', 'localhost'),
        port: config.get<number>('identity.redis.port', 6379),
        password: config.get<string>('identity.redis.password') || undefined,
      }),
    }),

    DatabaseModule,
    UsersModule,
    VerificationModule,
    OutboxModule,
    AuthModule,
  ],
})
export class AppModule { }