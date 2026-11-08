import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './verification.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { OutboxEvent } from '../../../../../libs/outbox/outbox.entity';
import { VerificationRepository } from './verification.repository';
import { OutboxModule } from '../../../../../libs/outbox/outbox.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode, OutboxEvent]),
    OutboxModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService, VerificationRepository],
  exports: [VerificationService],
})
export class VerificationModule {}