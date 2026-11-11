import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { PassengerType } from "../enums/passenger-type.enum";

const NATIONAL_ID_PATTERN = /^[0-9\u0660-\u0669\u06f0-\u06f9]{14}$/;

export class CreatePassengerDto {
  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @IsNotEmpty({ message: i18nValidationMessage("validation.required") })
  @Matches(/\S/, { message: i18nValidationMessage("validation.required") })
  @MaxLength(100, { message: i18nValidationMessage("validation.maxLength") })
  fullName!: string;

  @IsString({ message: i18nValidationMessage("validation.mustBeString") })
  @Matches(NATIONAL_ID_PATTERN, {
    message: i18nValidationMessage("validation.invalidNationalId"),
  })
  nationalId!: string;

  @IsEnum(PassengerType, {
    message: i18nValidationMessage("validation.invalidPassengerType"),
  })
  passengerType!: PassengerType;
}
