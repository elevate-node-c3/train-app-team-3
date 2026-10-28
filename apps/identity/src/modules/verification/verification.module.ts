
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './verification.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { OutboxEvent } from '../outbox/ outbox.entity';
OutboxEvent
@Module({
  imports: [TypeOrmModule.forFeature([VerificationCode, OutboxEvent])],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
