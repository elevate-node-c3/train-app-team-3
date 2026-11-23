import {
  IsArray, IsEnum, IsInt, IsNotEmpty,
  IsString, Min, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { SeatSide } from '../layout-seat.entity';

class CreateLayoutSeatDto {
  @IsString()
  @IsNotEmpty()
  seatNumber!: string;

  @IsInt()
  @Min(1)
  rowNumber!: number;

  @IsInt()
  @Min(1)
  position!: number;

  @IsEnum(SeatSide)
  side!: SeatSide;
}

export class CreateCoachLayoutDto {
  @IsString()
  @IsNotEmpty()
  name_ar!: string;

  @IsString()
  @IsNotEmpty()
  name_en!: string;

  @IsString()
  description!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLayoutSeatDto)
  seats!: CreateLayoutSeatDto[];
}