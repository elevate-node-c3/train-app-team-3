import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessedEvent } from '../../database/entities/processed-event.entity';
import { NotificationConsumer } from './notification.consumer';
import { MailerService } from './mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessedEvent])],
  controllers: [NotificationConsumer],
  providers: [MailerService],
})
export class NotificationModule {}