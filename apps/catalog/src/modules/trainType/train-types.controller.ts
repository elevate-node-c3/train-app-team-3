import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TrainTypesService } from './train-types.service';
import { CreateTrainTypeDto } from './dto/create-train-type.dto';
import { UpdateTrainTypeDto } from './dto/update-train-type.dto';

interface TrainTypeId {
  id: string;
}

type UpdateTrainTypeRequest = TrainTypeId & UpdateTrainTypeDto;

@Controller()
export class TrainTypesController {
  constructor(private readonly service: TrainTypesService) {}

  @GrpcMethod('TrainTypeService', 'CreateTrainType')
  createTrainType(data: CreateTrainTypeDto) {
    return this.service.create(data);
  }

  @GrpcMethod('TrainTypeService', 'GetTrainTypes')
  getTrainTypes() {
    return this.service.findAll();
  }

  @GrpcMethod('TrainTypeService', 'GetTrainType')
  getTrainType(data: TrainTypeId) {
    return this.service.findOne(data.id);
  }

  @GrpcMethod('TrainTypeService', 'UpdateTrainType')
  updateTrainType(data: UpdateTrainTypeRequest) {
    const { id, ...dto } = data;
    return this.service.update(id, dto);
  }

  @GrpcMethod('TrainTypeService', 'DeleteTrainType')
  deleteTrainType(data: TrainTypeId) {
    return this.service.remove(data.id);
  }
}