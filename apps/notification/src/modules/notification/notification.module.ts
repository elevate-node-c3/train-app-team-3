import { Module } from '@nestjs/common';
import { MailerModule } from '../mailer/mailer.module';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [MailerModule],
  providers: [NotificationConsumer],
  exports: [NotificationConsumer],
})
export class NotificationModule {}
