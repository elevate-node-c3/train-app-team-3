import {
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from "class-validator";

@ValidatorConstraint({ name: "matchesPassword", async: false })
class MatchesPasswordConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments): boolean {
    const { password } = args.object as RegisterDto;
    return confirmPassword === password;
  }

  defaultMessage(): string {
    return "confirmPassword must match password";
  }
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Validate(MatchesPasswordConstraint)
  confirmPassword!: string;
}
