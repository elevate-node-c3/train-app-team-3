import {IsArray , IsString , IsNotEmpty} from "class-validator";


export class AlternativeNamesDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  alternativeNames!: string[];
}