import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class LoginInDto {
  @IsEmail({}, { message: i18nValidationMessage("validation.invalidEmail") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  email!: string;

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512, { message: i18nValidationMessage("validation.maxLength") })
  deviceInfo?: string;
}
