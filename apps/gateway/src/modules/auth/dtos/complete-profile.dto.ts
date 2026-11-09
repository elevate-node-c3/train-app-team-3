import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

const EGYPTIAN_PHONE_PATTERN = /^(?:(?:\+20|0020)|0)?1[0125]\d{8}$/;

export class CompleteProfileDto {
  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @Matches(/\S/, { message: i18nValidationMessage("validation.required") })
  @MaxLength(100, { message: i18nValidationMessage("validation.maxLength") })
  fullName!: string;

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @Matches(/\S/, { message: i18nValidationMessage("validation.required") })
  @MaxLength(64, { message: i18nValidationMessage("validation.maxLength") })
  nationalId!: string;

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @Matches(EGYPTIAN_PHONE_PATTERN, {
    message: i18nValidationMessage("validation.invalidEgyptianPhone"),
  })
  phone!: string;

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @Matches(/\S/, { message: i18nValidationMessage("validation.required") })
  @MaxLength(32, { message: i18nValidationMessage("validation.maxLength") })
  profileType!: string;

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @Matches(/\S/, { message: i18nValidationMessage("validation.required") })
  @MaxLength(56, { message: i18nValidationMessage("validation.maxLength") })
  nationality!: string;
}
