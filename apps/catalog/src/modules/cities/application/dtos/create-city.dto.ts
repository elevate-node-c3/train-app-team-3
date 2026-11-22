import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name_ar!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name_en!: string;

  @IsUUID()
  governorateId!: string;
}
