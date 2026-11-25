
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateTimetableStopRequest,
  DeleteResponse,
  EmptyRequest,
  IdRequest,
  TimetableStopListResponse,
  TimetableStopResponse,
  UpdateTimetableStopRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { TimetableStopsService } from './timetable-stops.service';
import { TimetableStop } from './domain/entities/timetable-stop.entity';

@Controller()
export class TimetableStopsController {
  constructor(private readonly timetableStopsService: TimetableStopsService) {}

  private toResponse(stop: TimetableStop): TimetableStopResponse {
    return {
      id: stop.id,
      ...(stop.arrivalTime !== null && { arrivalTime: stop.arrivalTime }),
      ...(stop.departureTime !== null && {
        departureTime: stop.departureTime,
      }),
      stopOrder: stop.stopOrder,
      timetable: { id: stop.timeTable.id },
      station: { id: stop.station.id },
    };
  }

  @GrpcMethod('CatalogService', 'CreateTimetableStop')
  async createTimetableStop(
    data: CreateTimetableStopRequest,
  ): Promise<TimetableStopResponse> {
    requireGrpcFields(data, 'stopOrder', 'timetableId', 'stationId');
    return this.toResponse(
      await this.timetableStopsService.create(toCatalogApplicationData(data)),
    );
  }

  @GrpcMethod('CatalogService', 'GetTimetableStops')
  async getTimetableStops(
    _data: EmptyRequest,
  ): Promise<TimetableStopListResponse> {
    const stops = await this.timetableStopsService.findAll();
    return {
      items: stops.map((stop) => this.toResponse(stop)),
    };
  }

  @GrpcMethod('CatalogService', 'GetTimetableStop')
  async getTimetableStop(data: IdRequest): Promise<TimetableStopResponse> {
    requireGrpcFields(data, 'id');
    return this.toResponse(await this.timetableStopsService.findOne(data.id));
  }

  @GrpcMethod('CatalogService', 'UpdateTimetableStop')
  async updateTimetableStop(
    data: UpdateTimetableStopRequest,
  ): Promise<TimetableStopResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...dto } = data;
    return this.toResponse(
      await this.timetableStopsService.update(
        id,
        toCatalogApplicationData(dto),
      ),
    );
  }

  @GrpcMethod('CatalogService', 'DeleteTimetableStop')
  async deleteTimetableStop(data: IdRequest): Promise<DeleteResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(
      await this.timetableStopsService.remove(data.id),
    );
  }
}
