import { 
  IsString,
  IsNotEmpty,
  IsUUID, 
  IsBoolean, 
  IsOptional, 
  MaxLength, 
  IsArray} from 'class-validator';


export class UpdateStationDto {

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @IsOptional()
  name_ar?: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @IsUUID()
  @IsOptional()
  cityId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  alternativeNames?: string[];


}


