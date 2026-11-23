import { IsInt, Min } from 'class-validator';

export class UpdateFareDto {
  @IsInt()
  @Min(1)
  priceInPiasters!: number;
}