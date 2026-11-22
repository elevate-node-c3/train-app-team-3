import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  Matches,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { normalizeSearchNumber } from '../../../../../../libs/contracts/src/search-number';

export class SearchTripsDto {
  @IsUUID()
  origin_station_id!: string;

  @IsUUID()
  destination_station_id!: string;

  @IsDateString()
  departure_date!: string;

  @IsUUID()
  seat_class_id!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeSearchNumber(value) : value,
  )
  @IsString()
  @Matches(/^[1-9][0-9]*$/)
  train_number?: string;

  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  departure_time_from?: string;

  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  departure_time_to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maximum_fare_piastres?: number;

  @IsOptional()
  @IsString()
  train_type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1, 2])
  sort?: number;
}

export class GetTripStopsDto {
  @IsUUID()
  trip_id!: string;

  @IsUUID()
  origin_station_id!: string;

  @IsUUID()
  destination_station_id!: string;
}

export class QuoteFareDto {
  @IsUUID()
  trip_id!: string;

  @IsUUID()
  seat_class_id!: string;

  @IsUUID()
  origin_station_id!: string;

  @IsUUID()
  destination_station_id!: string;
}

export class PublishTimetableDto {
  @IsUUID()
  timetable_id!: string;
}
