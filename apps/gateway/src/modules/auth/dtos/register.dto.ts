import {
  IsEmail,
  IsNotEmpty,
  IsString,
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
  email!: string;

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  password!: string;

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @Validate(MatchesPasswordConstraint)
  confirmPassword!: string;
}
