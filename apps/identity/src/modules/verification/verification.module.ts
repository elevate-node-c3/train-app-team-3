import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entities/verification-code.entity';
import { VerificationService } from './verification.service';

@Module({
    imports: [TypeOrmModule.forFeature([VerificationCode])],
    providers: [VerificationService],
    exports: [VerificationService],
})
export class VerificationModule { }
