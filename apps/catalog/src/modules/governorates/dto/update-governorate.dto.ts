
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateGovernorateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
