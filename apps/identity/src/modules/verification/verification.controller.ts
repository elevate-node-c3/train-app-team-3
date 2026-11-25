<<<<<<< HEAD
<<<<<<< HEAD
=======
import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
>>>>>>> 8389a1345db1888c79488b31b9d1183334dc763d
import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
<<<<<<< HEAD
=======
import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
>>>>>>> 108e9ad55ca611bd9c8b62dfd959c2625b219ae5
=======
>>>>>>> 8389a1345db1888c79488b31b9d1183334dc763d
import { VerificationService } from './verification.service';
import { VerifyDto } from './dto/verify.dto';

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

<<<<<<< HEAD
<<<<<<< HEAD
=======
  @GrpcMethod('IdentityService', 'Verify')
  verify(@Payload() data: VerifyDto) {
    return this.verificationService.verifyCode(data);
>>>>>>> 8389a1345db1888c79488b31b9d1183334dc763d
  @Post('verify')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  verify(@Body() body: VerifyDto) {
    return this.verificationService.verifyCode(body);
<<<<<<< HEAD
=======
  @GrpcMethod('IdentityService', 'Verify')
  verify(@Payload() data: VerifyDto) {
    return this.verificationService.verifyCode(data);
>>>>>>> 108e9ad55ca611bd9c8b62dfd959c2625b219ae5
=======
>>>>>>> 8389a1345db1888c79488b31b9d1183334dc763d
  }
}