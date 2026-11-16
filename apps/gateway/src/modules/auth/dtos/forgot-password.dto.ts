import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class ForgotPasswordDto {
  @IsEmail({}, { message: i18nValidationMessage("validation.invalidEmail") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @MinLength(5, { message: i18nValidationMessage("validation.minLength") })
  @MaxLength(254, { message: i18nValidationMessage("validation.maxLength") })
  email!: string;
}
