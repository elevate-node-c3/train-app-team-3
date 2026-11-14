
import { IsBoolean, IsDateString, IsNotEmpty, IsString, IsUUID, IsArray } from 'class-validator';

export class UpdateTimetableDto {
  @IsString()
  @IsNotEmpty()
  departureTime!: string;

  @IsDateString()
  effectiveFrom!: string;

  @IsDateString()
  effectiveTo!: string;

  @IsArray()
  @IsString({ each: true })
  workingDays!: string[];

  @IsBoolean()
  status!: boolean;

  @IsUUID()
  trainId!: string;
}
