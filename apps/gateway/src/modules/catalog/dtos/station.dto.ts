import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateStationDto {
  @IsString()
  @MaxLength(100)
  name_ar!: string;

  @IsString()
  @MaxLength(100)
  name_en!: string;

  @IsString()
  address!: string;

  @IsUUID()
  cityId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternativeNames?: string[];
}

export class UpdateStationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_en?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUUID()
  cityId?: string;
}

export class UpdateAlternativeNamesDto {
  @IsArray()
  @IsString({ each: true })
  alternativeNames!: string[];
}

export class UpdateStationStatusDto {
  @IsBoolean()
  isActive!: boolean;
}

export class SearchStationsDto {
  @IsString()
  query!: string;
}

export class SearchStationRecordsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
