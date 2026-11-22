import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CityListResponse,
  CityResponse,
  CreateCityRequest,
  EmptyRequest,
  IdRequest,
  UpdateCityRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { City } from './domain/entities/city.entity';
import { CitiesService } from './cities.service';

@Controller()
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  private toResponse(city: City) {
    return {
      id: city.id,
      name_ar: city.name_ar,
      name_en: city.name_en,
      governorate_id: city.governorateId,
      governorate_name_ar: city.governorate.name_ar,
      governorate_name_en: city.governorate.name_en,
      created_at: city.createdAt.toISOString(),
      updated_at: city.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('CatalogService', 'CreateCity')
  async createCity(data: CreateCityRequest): Promise<CityResponse> {
    requireGrpcFields(data, 'nameAr', 'nameEn', 'governorateId');
    return toCatalogGrpcMessage(
      this.toResponse(
        await this.citiesService.create(toCatalogApplicationData(data)),
      ),
    );
  }

  @GrpcMethod('CatalogService', 'GetCities')
  async getCities(_data: EmptyRequest): Promise<CityListResponse> {
    const cities = await this.citiesService.findAll();
    return toCatalogGrpcMessage({
      cities: cities.map((city) => this.toResponse(city)),
    });
  }

  @GrpcMethod('CatalogService', 'GetCityById')
  async getCityById(data: IdRequest): Promise<CityResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(
      this.toResponse(await this.citiesService.findById(data.id)),
    );
  }

  @GrpcMethod('CatalogService', 'UpdateCity')
  async updateCity(data: UpdateCityRequest): Promise<CityResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...update } = data;
    return toCatalogGrpcMessage(
      this.toResponse(
        await this.citiesService.update(
          id,
          toCatalogApplicationData(update),
        ),
      ),
    );
  }
}
