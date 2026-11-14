import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TimetablesService } from './timetables.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

interface TimetableId {
  id: string;
}

type UpdateTimetableRequest = TimetableId & UpdateTimetableDto;

@Controller()
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @GrpcMethod('TimetableService', 'CreateTimetable')
  createTimetable(data: CreateTimetableDto) {
    return this.timetablesService.create(data);
  }

  @GrpcMethod('TimetableService', 'GetTimetables')
  getTimetables() {
    return this.timetablesService.findAll();
  }

  @GrpcMethod('TimetableService', 'GetTimetable')
  getTimetable(data: TimetableId) {
    return this.timetablesService.findOne(data.id);
  }

  @GrpcMethod('TimetableService', 'UpdateTimetable')
  updateTimetable(data: UpdateTimetableRequest) {
    const { id, ...dto } = data;
    return this.timetablesService.update(id, dto);
  }

  @GrpcMethod('TimetableService', 'DeleteTimetable')
  deleteTimetable(data: TimetableId) {
    return this.timetablesService.remove(data.id);
  }

  @GrpcMethod('CatalogService', 'PublishTimetable')
  async publishTimetable(data: { timetableId: string }) {
    await this.timetablesService.publish(data.timetableId);
    return { success: true };
  }
}