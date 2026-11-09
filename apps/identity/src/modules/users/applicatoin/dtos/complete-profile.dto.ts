import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

const EGYPTIAN_PHONE_PATTERN = /^(?:(?:\+20|0020)|0)?1[0125]\d{8}$/;

export class CompleteProfileDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(100)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(64)
  nationalId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(EGYPTIAN_PHONE_PATTERN)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(32)
  profileType!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(56)
  nationality!: string;
}
