import { IsBoolean } from "class-validator";

export class ActivitingDto {
 
  @IsBoolean()
  isActive!:boolean
  
}

