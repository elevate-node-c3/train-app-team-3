import { IsOptional, IsString } from 'class-validator';

export class UpdateTrainClassDto {
  @IsOptional()
  @IsString()
  name_ar?: string;

  @IsOptional()
  @IsString()
  name_en?: string;
}