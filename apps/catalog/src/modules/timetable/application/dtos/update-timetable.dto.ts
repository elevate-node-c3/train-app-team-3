
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class UpdateTimetableDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  departureTime?: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workingDays?: string[];

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsUUID()
  trainId?: string;
}
