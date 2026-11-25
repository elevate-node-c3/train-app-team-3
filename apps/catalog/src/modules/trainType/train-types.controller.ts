import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateTrainTypeRequest,
  DeleteResponse,
  EmptyRequest,
  IdRequest,
  TrainTypeListResponse,
  TrainTypeResponse,
  UpdateTrainTypeRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { TrainTypesService } from './train-types.service';

@Controller()
export class TrainTypesController {
  constructor(private readonly service: TrainTypesService) {}

  @GrpcMethod('CatalogService', 'CreateTrainType')
  async createTrainType(
    data: CreateTrainTypeRequest,
  ): Promise<TrainTypeResponse> {
    requireGrpcFields(data, 'nameAr', 'nameEn');
    return toCatalogGrpcMessage(
      await this.service.create(toCatalogApplicationData(data)),
    );
  }

  @GrpcMethod('CatalogService', 'GetTrainTypes')
  async getTrainTypes(_data: EmptyRequest): Promise<TrainTypeListResponse> {
    return toCatalogGrpcMessage({ items: await this.service.findAll() });
  }

  @GrpcMethod('CatalogService', 'GetTrainType')
  async getTrainType(data: IdRequest): Promise<TrainTypeResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.service.findOne(data.id));
  }

  @GrpcMethod('CatalogService', 'UpdateTrainType')
  async updateTrainType(
    data: UpdateTrainTypeRequest,
  ): Promise<TrainTypeResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...dto } = data;
    return toCatalogGrpcMessage(
      await this.service.update(id, toCatalogApplicationData(dto)),
    );
  }

  @GrpcMethod('CatalogService', 'DeleteTrainType')
  async deleteTrainType(data: IdRequest): Promise<DeleteResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.service.remove(data.id));
  }
}