
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateTimetableStopDto {
  @IsOptional()
  @IsString()
  arrivalTime?: string | null;

  @IsOptional()
  @IsString()
  departureTime?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  stopOrder?: number;

  @IsOptional()
  @IsUUID()
  timetableId?: string;

  @IsOptional()
  @IsUUID()
  stationId?: string;
}
