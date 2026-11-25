import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateTrainClassRequest,
  DeleteResponse,
  EmptyRequest,
  IdRequest,
  TrainClassListResponse,
  TrainClassResponse,
  UpdateTrainClassRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { TrainClassesService } from './train-classes.service';

@Controller()
export class TrainClassesController {
  constructor(private readonly service: TrainClassesService) {}

  @GrpcMethod('CatalogService', 'CreateTrainClass')
  async createTrainClass(
    data: CreateTrainClassRequest,
  ): Promise<TrainClassResponse> {
    requireGrpcFields(data, 'nameAr', 'nameEn');
    return toCatalogGrpcMessage(
      await this.service.create(toCatalogApplicationData(data)),
    );
  }

  @GrpcMethod('CatalogService', 'GetTrainClasses')
  async getTrainClasses(
    _data: EmptyRequest,
  ): Promise<TrainClassListResponse> {
    return toCatalogGrpcMessage({ items: await this.service.findAll() });
  }

  @GrpcMethod('CatalogService', 'GetTrainClass')
  async getTrainClass(data: IdRequest): Promise<TrainClassResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.service.findOne(data.id));
  }

  @GrpcMethod('CatalogService', 'UpdateTrainClass')
  async updateTrainClass(
    data: UpdateTrainClassRequest,
  ): Promise<TrainClassResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...dto } = data;
    return toCatalogGrpcMessage(
      await this.service.update(id, toCatalogApplicationData(dto)),
    );
  }

  @GrpcMethod('CatalogService', 'DeleteTrainClass')
  async deleteTrainClass(data: IdRequest): Promise<DeleteResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.service.remove(data.id));
  }
}