import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsString } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { context: { min: 8 } })
  @MaxLength(30, { context: { max: 30 } })
  password!: string;

  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsNotEmpty()
  @IsString()
  nationalId!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;
}
