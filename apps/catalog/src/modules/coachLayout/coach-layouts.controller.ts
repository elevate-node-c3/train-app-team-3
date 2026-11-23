import {
  Body, Controller, Delete, Get,
  Param, Patch, Post, ParseUUIDPipe
} from '@nestjs/common';
import { CreateCoachLayoutDto } from './dto/create-coach-layout.dto';
import { UpdateCoachLayoutDto } from './dto/update-coach-layout.dto';
import { CoachLayoutService } from './coach-layouts.service';

@Controller('coach-layouts')
export class CoachLayoutController {
  constructor(private readonly service: CoachLayoutService) {}

  @Post()
  create(@Body() dto: CreateCoachLayoutDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoachLayoutDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}