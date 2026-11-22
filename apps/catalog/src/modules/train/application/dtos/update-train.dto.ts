import { IsInt, IsOptional, IsUUID } from 'class-validator';

export class UpdateTrainDto {
  @IsOptional()
  @IsInt()
  number?: number;

  @IsOptional()
  @IsUUID()
  typeOfTrainId?: string;
}