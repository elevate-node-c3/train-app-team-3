import { IsUUID } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class PassengerIdDto {
  @IsUUID("4", { message: i18nValidationMessage("validation.invalidUuid") })
  id!: string;
}
