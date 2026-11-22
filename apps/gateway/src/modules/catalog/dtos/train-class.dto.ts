import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTrainClassDto {
  @IsString()
  @MaxLength(100)
  name_ar!: string;

  @IsString()
  @MaxLength(100)
  name_en!: string;
}

export class UpdateTrainClassDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_en?: string;
}
