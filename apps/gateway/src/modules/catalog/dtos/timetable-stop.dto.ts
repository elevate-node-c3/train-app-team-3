import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTimetableStopDto {
  @IsOptional()
  @IsString()
  arrival_time?: string;

  @IsOptional()
  @IsString()
  departure_time?: string;

  @IsInt()
  @Min(1)
  stop_order!: number;

  @IsUUID()
  timetable_id!: string;

  @IsUUID()
  station_id!: string;
}

export class UpdateTimetableStopDto {
  @IsOptional()
  @IsString()
  arrival_time?: string;

  @IsOptional()
  @IsString()
  departure_time?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  stop_order?: number;

  @IsOptional()
  @IsUUID()
  timetable_id?: string;

  @IsOptional()
  @IsUUID()
  station_id?: string;
}
