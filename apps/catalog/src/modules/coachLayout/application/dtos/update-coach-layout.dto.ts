import {
  IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional,
  IsString, Min, ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { SeatSide } from '../../domain/entities/layout-seat.entity';

class UpdateLayoutSeatDto {
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

export class UpdateCoachLayoutDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name_ar?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name_en?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLayoutSeatDto)
  seats?: UpdateLayoutSeatDto[];
}