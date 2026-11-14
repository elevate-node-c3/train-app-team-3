import { IsEnum } from 'class-validator';
import { DatedTripStatus } from '../dated-trip.entity';

export class UpdateDatedTripDto {
  @IsEnum(DatedTripStatus)
  status!: DatedTripStatus;
}