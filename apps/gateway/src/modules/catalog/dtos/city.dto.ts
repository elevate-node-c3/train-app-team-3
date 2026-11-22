import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @MaxLength(100)
  name_ar!: string;

  @IsString()
  @MaxLength(100)
  name_en!: string;

  @IsUUID()
  governorateId!: string;
}

export class UpdateCityDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_en?: string;

  @IsOptional()
  @IsUUID()
  governorateId?: string;
}
