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
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  @IsUUID()
  @IsOptional()
  governorateId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  alternativeNames?: string[];


}


