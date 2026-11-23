import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateFareDto } from './dto/create-fare.dto';
import { UpdateFareDto } from './dto/update-fare.dto';
import { FareService } from './fare.service';

@Controller('fares')
export class FareController {
  constructor(private readonly fareService: FareService) {}

  @Post()
  create(@Body() dto: CreateFareDto) {
    return this.fareService.create(dto);
  }

  @Get()
  findAll() {
    return this.fareService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fareService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFareDto,
  ) {
    return this.fareService.update(id, dto);
  }
}