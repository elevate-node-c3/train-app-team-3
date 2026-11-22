import {
  IsDateString,
  IsDefined,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecentSearchDto {
  @IsUUID()
  origin_station_id!: string;

  @IsUUID()
  destination_station_id!: string;

  @IsDateString()
  departure_date!: string;

  @IsOptional()
  @IsDateString()
  return_date?: string;

  @IsOptional()
  @IsUUID()
  seat_class_id?: string;

  @IsOptional()
  @IsString()
  train_number?: string;
}

export class SaveRecentSearchDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => RecentSearchDto)
  search!: RecentSearchDto;
}
