import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerifyDto } from './dto/verify.dto';

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @GrpcMethod('IdentityService', 'Verify')
  verify(@Payload() data: VerifyDto) {
    return this.verificationService.verifyCode(data);
  @Post('verify')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  verify(@Body() body: VerifyDto) {
    return this.verificationService.verifyCode(body);
  }
}