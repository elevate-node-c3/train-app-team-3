import { IsEnum } from 'class-validator';
import { DatedTripStatus } from '../../domain/entities/dated-trip.entity';

export class UpdateDatedTripDto {
  @IsEnum(DatedTripStatus)
  status!: DatedTripStatus;
}