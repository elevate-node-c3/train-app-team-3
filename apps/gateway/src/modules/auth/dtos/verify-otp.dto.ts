import { IsEmail, IsNotEmpty, Matches } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class VerifyOtpDto {
  @IsEmail({}, { message: i18nValidationMessage("validation.invalidEmail") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  email!: string;

  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @Matches(/^\d{6}$/, { message: i18nValidationMessage("validation.otpInvalid") })
  otp!: string;
}
