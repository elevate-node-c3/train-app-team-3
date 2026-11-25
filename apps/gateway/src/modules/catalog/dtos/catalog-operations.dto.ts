import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ChangeFaresDto {
  @IsUUID()
  train_id!: string;

  @IsUUID()
  seat_class_id!: string;

  @IsUUID()
  origin_station_id!: string;

  @IsUUID()
  destination_station_id!: string;

  @IsInt()
  @Min(1)
  fare_piastres!: number;
}

export class DelayTripDto {
  @IsUUID()
  trip_id!: string;

  @IsUUID()
  from_station_id!: string;

  @IsInt()
  @Min(1)
  delay_minutes!: number;
}

export class CancelTripDto {
  @IsUUID()
  trip_id!: string;
}
