import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

@ValidatorConstraint({ name: "matchesPassword", async: false })
class MatchesPasswordConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments): boolean {
    const { password } = args.object as RegisterDto;
    return confirmPassword === password;
  }

  defaultMessage(args: ValidationArguments): string {
    return i18nValidationMessage("validation.passwordsMustMatch")(args);
  }
}

export class RegisterDto {
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

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @MinLength(8, { message: i18nValidationMessage("validation.minLength") })
  @MaxLength(72, { message: i18nValidationMessage("validation.maxLength") })
  @Validate(MatchesPasswordConstraint)
  confirmPassword!: string;
}
