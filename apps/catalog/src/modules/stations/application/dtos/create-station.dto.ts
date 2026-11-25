import { 
  IsString,
  IsNotEmpty,
  IsUUID, 
  IsBoolean, 
  IsOptional, 
  MaxLength,
  IsArray } from 'class-validator';


export class CreateStationDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name_ar!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name_en!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsUUID()
  @IsNotEmpty()
  cityId!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  alternativeNames?: string[];


}


