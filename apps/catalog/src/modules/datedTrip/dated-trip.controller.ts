import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DatedTripService } from './dated-trip.service';
import { CreateDatedTripDto } from './dto/create-dated-trip.dto';
import { UpdateDatedTripDto } from './dto/update-dated-trip.dto';

@Controller('dated-trips')
export class DatedTripController {
  constructor(private readonly datedTripService: DatedTripService) {}

  @Post()
  create(@Body() dto: CreateDatedTripDto) {
    return this.datedTripService.create(dto);
  }

  @Get()
  findAll() {
    return this.datedTripService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.datedTripService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDatedTripDto,
  ) {
    return this.datedTripService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.datedTripService.remove(id);
  }
}