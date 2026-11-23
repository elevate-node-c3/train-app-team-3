import { IsString } from 'class-validator';

export class CreateTrainClassDto {
  @IsString()
  name_ar!: string;

  @IsString()
  name_en!: string;
}