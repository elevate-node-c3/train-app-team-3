import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResendCodeDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  language?: string;
}
