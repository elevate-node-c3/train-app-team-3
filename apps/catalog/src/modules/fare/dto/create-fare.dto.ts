import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateFareDto {
  @IsUUID()
  trainId!: string;

  @IsUUID()
  trainClassId!: string;

  @IsUUID()
  originStationId!: string;

  @IsUUID()
  destinationStationId!: string;

  @IsInt()
  @Min(1)
  priceInPiasters!: number;
}