import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateCoachDto {
  @IsInt()
  @Min(1)
  coach_number!: number;

  @IsUUID()
  train_id!: string;

  @IsUUID()
  class_of_train_id!: string;

  @IsUUID()
  coach_layout_id!: string;
}

export class UpdateCoachDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  coach_number?: number;

  @IsOptional()
  @IsUUID()
  train_id?: string;

  @IsOptional()
  @IsUUID()
  class_of_train_id?: string;

  @IsOptional()
  @IsUUID()
  coach_layout_id?: string;
}
