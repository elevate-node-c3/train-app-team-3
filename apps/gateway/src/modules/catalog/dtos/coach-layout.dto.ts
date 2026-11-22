import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCoachLayoutDto {
  @IsString()
  @MaxLength(100)
  name_ar!: string;

  @IsString()
  @MaxLength(100)
  name_en!: string;

  @IsString()
  description!: string;
}

export class UpdateCoachLayoutDto {
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
  description?: string;
}
