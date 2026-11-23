import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TrainClassesService } from './train-classes.service';
import { CreateTrainClassDto } from './dto/create-train-class.dto';
import { UpdateTrainClassDto } from './dto/update-train-class.dto';

interface TrainClassId {
  id: string;
}

type UpdateTrainClassRequest = TrainClassId & UpdateTrainClassDto;

@Controller()
export class TrainClassesController {
  constructor(private readonly service: TrainClassesService) {}

  @GrpcMethod('TrainClassService', 'CreateTrainClass')
  createTrainClass(data: CreateTrainClassDto) {
    return this.service.create(data);
  }

  @GrpcMethod('TrainClassService', 'GetTrainClasses')
  getTrainClasses() {
    return this.service.findAll();
  }

  @GrpcMethod('TrainClassService', 'GetTrainClass')
  getTrainClass(data: TrainClassId) {
    return this.service.findOne(data.id);
  }

  @GrpcMethod('TrainClassService', 'UpdateTrainClass')
  updateTrainClass(data: UpdateTrainClassRequest) {
    const { id, ...dto } = data;
    return this.service.update(id, dto);
  }

  @GrpcMethod('TrainClassService', 'DeleteTrainClass')
  deleteTrainClass(data: TrainClassId) {
    return this.service.remove(data.id);
  }
}