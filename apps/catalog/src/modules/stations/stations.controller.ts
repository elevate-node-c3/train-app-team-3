
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateStationRequest,
  EmptyRequest,
  GroupedStationListResponse,
  SearchStationRequest,
  StationListResponse,
  StationResponse,
  UpdateAlternativeNamesRequest,
  UpdateStationRequest,
  UpdateStationStatusRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { StationsService } from './stations.service';
import { Station } from './domain/entities/station.entity';

@Controller()
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  private toResponse(station: Station) {
    return {
      id: station.id,
      name: station.name_en,
      name_en: station.name_en,
      name_ar: station.name_ar,
      address: station.address,
      is_active: station.isActive,
      governorate_id: station.city.governorateId,
      alternative_names: station.alternativeNames ?? [],
      created_at: station.createdAt.toISOString(),
      updated_at: station.updatedAt.toISOString(),
      city_id: station.cityId,
    };
  }

  @GrpcMethod('CatalogService', 'CreateStation')
  async createStation(data: CreateStationRequest): Promise<StationResponse> {
    requireGrpcFields(data, 'address', 'cityId', 'nameAr', 'nameEn');
    return toCatalogGrpcMessage(
      this.toResponse(
        await this.stationsService.createStation(
          toCatalogApplicationData(data),
        ),
      ),
    );
  }

  @GrpcMethod('CatalogService', 'GetStations')
  async getStations(
    _data: EmptyRequest,
  ): Promise<GroupedStationListResponse> {
    const governorates = await this.stationsService.getAllStation();
    return {
      governorates: governorates.map((governorate) => ({
        id: governorate.id,
        name: governorate.name_en,
        stations: governorate.stations.map((station) =>
          toCatalogGrpcMessage(this.toResponse(station)),
        ),
      })),
    };
  }

  @GrpcMethod('CatalogService', 'SearchStationRecords')
  async searchStations(
    data: SearchStationRequest,
  ): Promise<StationListResponse> {
    requireGrpcFields(data, 'q');
    const stations = await this.stationsService.findByName(data.q);
    return toCatalogGrpcMessage({ stations });
  }

  @GrpcMethod('CatalogService', 'UpdateStation')
  async updateStation(data: UpdateStationRequest): Promise<StationResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...updateData } = data;
    return toCatalogGrpcMessage(
      this.toResponse(
        await this.stationsService.updateStation(
          id,
          toCatalogApplicationData(updateData),
        ),
      ),
    );
  }

  @GrpcMethod('CatalogService', 'UpdateAlternativeNames')
  async updateAlternativeNames(
    data: UpdateAlternativeNamesRequest,
  ): Promise<StationResponse> {
    requireGrpcFields(data, 'id', 'alternativeNames');
    return toCatalogGrpcMessage(
      this.toResponse(
        await this.stationsService.updateAlternativeNames(
          data.id,
          data.alternativeNames,
        ),
      ),
    );
  }

  @GrpcMethod('CatalogService', 'UpdateStationStatus')
  async updateStationStatus(
    data: UpdateStationStatusRequest,
  ): Promise<StationResponse> {
    requireGrpcFields(data, 'id', 'isActive');
    return toCatalogGrpcMessage(
      this.toResponse(
        await this.stationsService.updateStatus(data.id, data.isActive),
      ),
    );
  }
}
