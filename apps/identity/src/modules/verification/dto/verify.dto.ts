import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { VerificationPurpose } from '../../../../../../libs/contracts/src/verification-code-issued.event';

export class VerifyDto {
  @IsEmail()
  @MinLength(5)
  @MaxLength(254)
  email!: string;

  @IsString()
  code!: string;

  @IsIn(['email-verification', 'password-reset'])
  purpose!: VerificationPurpose;
}