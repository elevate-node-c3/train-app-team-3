import { IsInt, IsUUID, Min } from 'class-validator';

export class UpdateCoachDto {
  @IsInt()
  @Min(1)
  coachNumber!: number;

  @IsUUID()
  trainId!: string;

  @IsUUID()
  classOfTrainId!: string;

  @IsUUID()
  coachLayoutId!: string;
}
