import { IsString } from 'class-validator';

export class UpdateTrainClassDto {
  @IsString()
  name_ar!: string;

  @IsString()
  name_en!: string;
}