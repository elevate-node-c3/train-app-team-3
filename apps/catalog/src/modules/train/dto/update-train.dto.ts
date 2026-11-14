import { IsInt, IsUUID } from 'class-validator';

export class UpdateTrainDto {
  @IsInt()
  number!: number;

  @IsUUID()
  typeOfTrainId!: string;
}