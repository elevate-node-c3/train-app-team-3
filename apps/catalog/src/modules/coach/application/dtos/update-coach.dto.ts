import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateCoachDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  coachNumber?: number;

  @IsOptional()
  @IsUUID()
  trainId?: string;

  @IsOptional()
  @IsUUID()
  classOfTrainId?: string;

  @IsOptional()
  @IsUUID()
  coachLayoutId?: string;
}
