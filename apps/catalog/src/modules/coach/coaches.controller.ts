
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CoachListResponse,
  CoachResponse,
  CreateCoachRequest,
  DeleteResponse,
  EmptyRequest,
  IdRequest,
  UpdateCoachRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { CoachesService } from './coaches.service';

@Controller()
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @GrpcMethod('CatalogService', 'CreateCoach')
  async createCoach(data: CreateCoachRequest): Promise<CoachResponse> {
    requireGrpcFields(
      data,
      'coachNumber',
      'trainId',
      'classOfTrainId',
      'coachLayoutId',
    );
    return toCatalogGrpcMessage(
      await this.coachesService.create(toCatalogApplicationData(data)),
    );
  }

  @GrpcMethod('CatalogService', 'GetCoaches')
  async getCoaches(_data: EmptyRequest): Promise<CoachListResponse> {
    return toCatalogGrpcMessage({ items: await this.coachesService.findAll() });
  }

  @GrpcMethod('CatalogService', 'GetCoach')
  async getCoach(data: IdRequest): Promise<CoachResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.coachesService.findOne(data.id));
  }

  @GrpcMethod('CatalogService', 'UpdateCoach')
  async updateCoach(data: UpdateCoachRequest): Promise<CoachResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...dto } = data;
    return toCatalogGrpcMessage(
      await this.coachesService.update(id, toCatalogApplicationData(dto)),
    );
  }

  @GrpcMethod('CatalogService', 'DeleteCoach')
  async deleteCoach(data: IdRequest): Promise<DeleteResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.coachesService.remove(data.id));
  }
}
