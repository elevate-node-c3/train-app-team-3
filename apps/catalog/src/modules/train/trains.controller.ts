import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateTrainRequest,
  DeleteResponse,
  EmptyRequest,
  IdRequest,
  TrainListResponse,
  TrainResponse,
  UpdateTrainRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { TrainsService } from './trains.service';

@Controller()
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @GrpcMethod('CatalogService', 'CreateTrain')
  async createTrain(data: CreateTrainRequest): Promise<TrainResponse> {
    requireGrpcFields(data, 'number', 'typeOfTrainId');
    return toCatalogGrpcMessage(
      await this.trainsService.create(toCatalogApplicationData(data)),
    );
  }

  @GrpcMethod('CatalogService', 'GetTrains')
  async getTrains(_data: EmptyRequest): Promise<TrainListResponse> {
    return toCatalogGrpcMessage({ items: await this.trainsService.findAll() });
  }

  @GrpcMethod('CatalogService', 'GetTrain')
  async getTrain(data: IdRequest): Promise<TrainResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.trainsService.findOne(data.id));
  }

  @GrpcMethod('CatalogService', 'UpdateTrain')
  async updateTrain(data: UpdateTrainRequest): Promise<TrainResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...dto } = data;
    return toCatalogGrpcMessage(
      await this.trainsService.update(id, toCatalogApplicationData(dto)),
    );
  }

  @GrpcMethod('CatalogService', 'DeleteTrain')
  async deleteTrain(data: IdRequest): Promise<DeleteResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.trainsService.remove(data.id));
  }
}