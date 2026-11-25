import { IsString , MaxLength , IsNotEmpty} from "class-validator";


export class NameDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!:string;



}