
import { Body, Controller, Post } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationPurpose } from '../../../../../libs/contracts/src/verification-code-issued.event';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('verify')
  verify(@Body() body: {
    email: string;
    code: string;
    purpose: VerificationPurpose;
  }) {
    return this.verificationService.verifyCode(body);
  }
}
