import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be exactly 6 digits' })
  code!: string;
}
