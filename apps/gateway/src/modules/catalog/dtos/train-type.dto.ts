import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTrainTypeDto {
  @IsString()
  @MaxLength(100)
  name_ar!: string;

  @IsString()
  @MaxLength(100)
  name_en!: string;
}

export class UpdateTrainTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_en?: string;
}
