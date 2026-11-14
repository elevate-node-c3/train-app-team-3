import { IsInt, IsUUID } from 'class-validator';

export class CreateTrainDto {
  @IsInt()
  number!: number;

  @IsUUID()
  typeOfTrainId!: string;
}