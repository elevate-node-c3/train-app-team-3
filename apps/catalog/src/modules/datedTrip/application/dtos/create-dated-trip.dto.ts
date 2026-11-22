import { IsDateString, IsUUID } from 'class-validator';

export class CreateDatedTripDto {
  @IsUUID()
  trainId!: string;

  @IsUUID()
  timetableId!: string;

  @IsDateString()
  serviceDate!: string;
}