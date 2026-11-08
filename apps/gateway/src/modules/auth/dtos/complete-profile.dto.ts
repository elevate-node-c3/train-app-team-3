import { IsNotEmpty, IsString } from "class-validator";

export class CompleteProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  nationalId!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  profileType!: string;

  @IsString()
  @IsNotEmpty()
  nationality!: string;
}
