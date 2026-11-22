<<<<<<< HEAD
import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
=======
import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
>>>>>>> 108e9ad55ca611bd9c8b62dfd959c2625b219ae5
import { VerificationService } from './verification.service';
import { VerifyDto } from './dto/verify.dto';

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

<<<<<<< HEAD
  @Post('verify')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  verify(@Body() body: VerifyDto) {
    return this.verificationService.verifyCode(body);
=======
  @GrpcMethod('IdentityService', 'Verify')
  verify(@Payload() data: VerifyDto) {
    return this.verificationService.verifyCode(data);
>>>>>>> 108e9ad55ca611bd9c8b62dfd959c2625b219ae5
  }
}