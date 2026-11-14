import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TrainsService } from './trains.service';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';

interface TrainId {
  id: string;
}

type UpdateTrainRequest = TrainId & UpdateTrainDto;

@Controller()
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @GrpcMethod('TrainService', 'CreateTrain')
  createTrain(data: CreateTrainDto) {
    return this.trainsService.create(data);
  }

  @GrpcMethod('TrainService', 'GetTrains')
  getTrains() {
    return this.trainsService.findAll();
  }

  @GrpcMethod('TrainService', 'GetTrain')
  getTrain(data: TrainId) {
    return this.trainsService.findOne(data.id);
  }

  @GrpcMethod('TrainService', 'UpdateTrain')
  updateTrain(data: UpdateTrainRequest) {
    const { id, ...dto } = data;
    return this.trainsService.update(id, dto);
  }

  @GrpcMethod('TrainService', 'DeleteTrain')
  deleteTrain(data: TrainId) {
    return this.trainsService.remove(data.id);
  }
}