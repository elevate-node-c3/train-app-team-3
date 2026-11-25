import {
  Body, Controller, Delete, Get,
  Param, Patch, Post, ParseUUIDPipe
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CoachLayoutListResponse,
  CoachLayoutResponse,
  CreateCoachLayoutRequest,
  DeleteResponse,
  EmptyRequest,
  IdRequest,
  UpdateCoachLayoutRequest,
} from '@app/contracts/generated/catalog/messages.grpc.interfaces';
import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from '../../../../../libs/contracts/src/catalog-message.mapper';
import { requireGrpcFields } from '../../grpc/require-grpc-fields';
import { CreateCoachLayoutDto } from './application/dtos/create-coach-layout.dto';
import { UpdateCoachLayoutDto } from './application/dtos/update-coach-layout.dto';
import { CoachLayoutService } from './coach-layouts.service';

@Controller('coach-layouts')
export class CoachLayoutController {
  constructor(private readonly service: CoachLayoutService) {}

  @GrpcMethod('CatalogService', 'CreateCoachLayout')
  async createCoachLayout(
    data: CreateCoachLayoutRequest,
  ): Promise<CoachLayoutResponse> {
    requireGrpcFields(data, 'nameAr', 'nameEn', 'description');
    return toCatalogGrpcMessage(
      await this.service.create({
        ...toCatalogApplicationData(data),
        seats: [],
      }),
    );
  }

  @GrpcMethod('CatalogService', 'GetCoachLayouts')
  async getCoachLayouts(
    _data: EmptyRequest,
  ): Promise<CoachLayoutListResponse> {
    return toCatalogGrpcMessage({ items: await this.service.findAll() });
  }

  @GrpcMethod('CatalogService', 'GetCoachLayout')
  async getCoachLayout(data: IdRequest): Promise<CoachLayoutResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.service.findOne(data.id));
  }

  @GrpcMethod('CatalogService', 'UpdateCoachLayout')
  async updateCoachLayout(
    data: UpdateCoachLayoutRequest,
  ): Promise<CoachLayoutResponse> {
    requireGrpcFields(data, 'id');
    const { id, ...dto } = data;
    return toCatalogGrpcMessage(
      await this.service.update(id, toCatalogApplicationData(dto)),
    );
  }

  @GrpcMethod('CatalogService', 'DeleteCoachLayout')
  async deleteCoachLayout(data: IdRequest): Promise<DeleteResponse> {
    requireGrpcFields(data, 'id');
    return toCatalogGrpcMessage(await this.service.remove(data.id));
  }

  @Post()
  create(@Body() dto: CreateCoachLayoutDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoachLayoutDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}