
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateTimetableStopDto {
  @IsOptional()
  @IsString()
  arrivalTime?: string | null;

  @IsOptional()
  @IsString()
  departureTime?: string | null;

  @IsInt()
  @Min(1)
  stopOrder!: number;

  @IsUUID()
  timetableId!: string;

  @IsUUID()
  stationId!: string;
}
