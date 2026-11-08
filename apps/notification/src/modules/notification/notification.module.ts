import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingModule } from '@app/messaging';
import { ProcessedEvent } from '../../database/entities/processed-event.entity';
import { RabbitMQTopologyService } from '../../messaging/rabbitmq-topology.service';
import { NotificationConsumer } from './notification.consumer';
import { MailerService } from './mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessedEvent]), MessagingModule],
  controllers: [NotificationConsumer],
  providers: [MailerService, RabbitMQTopologyService],
})
export class NotificationModule {}