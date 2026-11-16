import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class LoginInDto {
  @IsEmail({}, { message: i18nValidationMessage("validation.invalidEmail") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @MinLength(5, { message: i18nValidationMessage("validation.minLength") })
  @MaxLength(254, { message: i18nValidationMessage("validation.maxLength") })
  email!: string;

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @MinLength(8, { message: i18nValidationMessage("validation.minLength") })
  @MaxLength(72, { message: i18nValidationMessage("validation.maxLength") })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512, { message: i18nValidationMessage("validation.maxLength") })
  deviceInfo?: string;
}
