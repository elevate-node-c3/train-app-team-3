import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { VerificationService } from './verification.service';
import { VerifyDto } from './dto/verify.dto';

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @GrpcMethod('IdentityService', 'Verify')
  verify(@Payload() data: VerifyDto) {
    return this.verificationService.verifyCode(data);
  }
}