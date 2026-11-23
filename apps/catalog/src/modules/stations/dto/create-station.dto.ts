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
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsUUID()
  @IsNotEmpty()
  governorateId!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  alternativeNames?: string[];


}


