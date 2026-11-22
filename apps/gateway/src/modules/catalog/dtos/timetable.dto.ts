import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTimetableDto {
  @IsString()
  departure_time!: string;

  @IsDateString()
  effective_from!: string;

  @IsDateString()
  effective_to!: string;

  @IsArray()
  @IsString({ each: true })
  working_days!: string[];

  @IsBoolean()
  status!: boolean;

  @IsUUID()
  train_id!: string;
}

export class UpdateTimetableDto {
  @IsOptional()
  @IsString()
  departure_time?: string;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  working_days?: string[];

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsUUID()
  train_id?: string;
}
