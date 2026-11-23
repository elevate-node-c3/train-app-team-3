import { IsString } from 'class-validator';

export class UpdateTrainTypeDto {
  @IsString()
  name_ar!: string;

  @IsString()
  name_en!: string;
}