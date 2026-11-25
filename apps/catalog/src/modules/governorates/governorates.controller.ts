
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateGovernorateRequest,
  EmptyRequest,
  GetGovernorateByIdRequest,
  GovernorateListResponse,
  GovernorateResponse,
  UpdateGovernorateRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { GovernoratesService } from './governorates.service';
import { Governorate } from './domain/entities/governorate.entity';

@Controller()
export class GovernoratesController {
  constructor(private readonly governoratesService: GovernoratesService) {}

  private toResponse(governorate: Governorate) {
    return {
      id: governorate.id,
      name_ar: governorate.name_ar,
      name_en: governorate.name_en,
      createdAt: governorate.createdAt.toISOString(),
      updatedAt: governorate.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('CatalogService', 'CreateGovernorate')
  async createGovernorate(
    data: CreateGovernorateRequest,
  ): Promise<GovernorateResponse> {
    requireGrpcFields(data, 'nameAr', 'nameEn');
    const governorate = await this.governoratesService.create(
      toCatalogApplicationData(data),
    );
    return toCatalogGrpcMessage(this.toResponse(governorate));
  }

  @GrpcMethod('CatalogService', 'GetGovernorates')
  async getGovernorates(
    _data: EmptyRequest,
  ): Promise<GovernorateListResponse> {
    const governorates = await this.governoratesService.findAll();
    return toCatalogGrpcMessage({
      governorates: governorates.map((governorate) =>
        this.toResponse(governorate),
      ),
    });
  }

  @GrpcMethod('CatalogService', 'GetGovernorateById')
  async getGovernorateById(
    data: GetGovernorateByIdRequest,
  ): Promise<GovernorateResponse> {
    requireGrpcFields(data, 'id');
    const governorate = await this.governoratesService.findById(data.id);
    return toCatalogGrpcMessage(this.toResponse(governorate));
  }

  @GrpcMethod('CatalogService', 'UpdateGovernorate')
  async updateGovernorate(
    data: UpdateGovernorateRequest,
  ): Promise<GovernorateResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...update } = data;
    const governorate = await this.governoratesService.update(
      id,
      toCatalogApplicationData(update),
    );
    return toCatalogGrpcMessage(this.toResponse(governorate));
  }
}
