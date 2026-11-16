import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerifyDto } from './dto/verify.dto';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('verify')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  verify(@Body() body: VerifyDto) {
    return this.verificationService.verifyCode(body);
  }
}
