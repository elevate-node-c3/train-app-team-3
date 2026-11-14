import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGovernorateDto {
  @IsString()
  @IsNotEmpty()
  name_ar!: string;

  @IsString()
  @IsNotEmpty()
  name_en!: string;
}