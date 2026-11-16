import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(254)
  email!: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
