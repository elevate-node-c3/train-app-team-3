import { IsString } from 'class-validator';

export class CreateTrainTypeDto {
  @IsString()
  name_ar!: string;

  @IsString()
  name_en!: string;
}