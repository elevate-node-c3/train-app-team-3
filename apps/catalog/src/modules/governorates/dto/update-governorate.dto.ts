import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateGovernorateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name_ar?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name_en?: string;
}