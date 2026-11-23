
import { Controller, Param, Post } from '@nestjs/common';
import { TripGenerationService } from './trip-generation.service';

@Controller('trip-generation')
export class TripGenerationController {
  constructor(
    private readonly tripGenerationService: TripGenerationService,
  ) {}

  @Post(':serviceDate')
  generate(@Param('serviceDate') serviceDate: string) {
    return this.tripGenerationService.generateForDate(serviceDate);
  }
}
