import { IsNotEmpty, IsString , MaxLength } from "class-validator";

  export class IsGovernorate {
      
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  governorate!: string;


    
  }