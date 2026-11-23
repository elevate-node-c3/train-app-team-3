
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TimetableStopsService } from './timetable-stops.service';
import { CreateTimetableStopDto } from './dto/create-timetable-stop.dto';
import { UpdateTimetableStopDto } from './dto/update-timetable-stop.dto';

interface TimetableStopId {
  id: string;
}

type UpdateTimetableStopRequest = TimetableStopId & UpdateTimetableStopDto;

@Controller()
export class TimetableStopsController {
  constructor(private readonly timetableStopsService: TimetableStopsService) {}

  @GrpcMethod('TimetableStopService', 'CreateTimetableStop')
  createTimetableStop(data: CreateTimetableStopDto) {
    return this.timetableStopsService.create(data);
  }

  @GrpcMethod('TimetableStopService', 'GetTimetableStops')
  getTimetableStops() {
    return this.timetableStopsService.findAll();
  }

  @GrpcMethod('TimetableStopService', 'GetTimetableStop')
  getTimetableStop(data: TimetableStopId) {
    return this.timetableStopsService.findOne(data.id);
  }

  @GrpcMethod('TimetableStopService', 'UpdateTimetableStop')
  updateTimetableStop(data: UpdateTimetableStopRequest) {
    const { id, ...dto } = data;
    return this.timetableStopsService.update(id, dto);
  }

  @GrpcMethod('TimetableStopService', 'DeleteTimetableStop')
  deleteTimetableStop(data: TimetableStopId) {
    return this.timetableStopsService.remove(data.id);
  }
}
