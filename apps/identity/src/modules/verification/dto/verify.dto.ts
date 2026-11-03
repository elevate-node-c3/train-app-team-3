import { IsEmail, IsIn, IsString } from 'class-validator';
import { VerificationPurpose } from '../../../../../../libs/contracts/src/verification-code-issued.event';

export class VerifyDto {
  @IsEmail()
  email!: string;

  @IsString()
  code!: string;

  @IsIn(['email-verification', 'password-reset'])
  purpose!: VerificationPurpose;
}