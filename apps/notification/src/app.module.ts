import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';
import { MailerModule } from './modules/mailer/mailer.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MailerModule,
    NotificationModule,
  ],
})
export class AppModule {}
