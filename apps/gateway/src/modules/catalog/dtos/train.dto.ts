import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateTrainDto {
  @IsInt()
  @Min(1)
  number!: number;

  @IsUUID()
  type_of_train_id!: string;
}

export class UpdateTrainDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @IsOptional()
  @IsUUID()
  type_of_train_id?: string;
}
