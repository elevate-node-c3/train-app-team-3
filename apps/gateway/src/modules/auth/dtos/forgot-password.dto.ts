<<<<<<< Updated upstream
import { IsEmail, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from "nestjs-i18n";

export class ForgotPasswordDto {
  @IsEmail({}, { message: i18nValidationMessage("validation.invalidEmail") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
=======
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
>>>>>>> Stashed changes
  email!: string;
}
