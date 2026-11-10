import { IsString, IsNotEmpty } from 'class-validator';



export class CreateGovernorateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
