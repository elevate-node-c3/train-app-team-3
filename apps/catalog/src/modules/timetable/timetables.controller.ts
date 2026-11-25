import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  DeleteResponse,
  EmptyRequest,
  IdRequest,
  OperationResponse,
  PublishTimetableRequest,
  TimetableListResponse,
  TimetableResponse,
  UpdateTimetableRequest,
  CreateTimetableRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { TimetablesService } from './timetables.service';

@Controller()
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @GrpcMethod('CatalogService', 'CreateTimetable')
  async createTimetable(
    data: CreateTimetableRequest,
  ): Promise<TimetableResponse> {
    requireGrpcFields(
      data,
      'departureTime',
      'effectiveFrom',
      'effectiveTo',
      'workingDays',
      'status',
      'trainId',
    );
    return toCatalogGrpcMessage(
      await this.timetablesService.create(toCatalogApplicationData(data)),
    );
  }

  @GrpcMethod('CatalogService', 'GetTimetables')
  async getTimetables(_data: EmptyRequest): Promise<TimetableListResponse> {
    return toCatalogGrpcMessage({
      items: await this.timetablesService.findAll(),
    });
  }

  @GrpcMethod('CatalogService', 'GetTimetable')
  async getTimetable(data: IdRequest): Promise<TimetableResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(
      await this.timetablesService.findOne(data.id),
    );
  }

  @GrpcMethod('CatalogService', 'UpdateTimetable')
  async updateTimetable(
    data: UpdateTimetableRequest,
  ): Promise<TimetableResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...dto } = data;
    return toCatalogGrpcMessage(
      await this.timetablesService.update(
        id,
        toCatalogApplicationData(dto),
      ),
    );
  }

  @GrpcMethod('CatalogService', 'DeleteTimetable')
  async deleteTimetable(data: IdRequest): Promise<DeleteResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(
      await this.timetablesService.remove(data.id),
    );
  }

  @GrpcMethod('CatalogService', 'PublishTimetable')
  async publishTimetable(
    data: PublishTimetableRequest,
  ): Promise<OperationResponse> {
    requireGrpcFields(data, 'timetableId');
    await this.timetablesService.publish(data.timetableId);
    return { success: true };
  }
}